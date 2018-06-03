const redisClient = require('./redis-client')
const TIMEOUT_IN_SECONDS = 3600
const sessionPath = '/CodePadServer/'

module.exports = (io, collaborationSessions, socketToSession, usersInfo) => {
	const broadcastUserInfo = (io, ssid) => {
		const idList = collaborationSessions.get(ssid)['userSocketId']
		const res = []
		idList.forEach((socketId) => {
			res.push(usersInfo.get(socketId))
		})

		idList.forEach((socketId) => {
			console.log(`[*] Send user info to: ${usersInfo.get(socketId).name}`)
			io.to(socketId).emit('usersInSession', JSON.stringify(res))
		})
	}

	io.on('connection', (socket) => {
		const name = socket.handshake.query['name']
		const pic = socket.handshake.query['pic']
		const nick = socket.handshake.query['nick']
		const ssid = socket.handshake.query['ssid']
		console.log(ssid)
		console.log(pic)
		socketToSession.set(socket.id, ssid)
		usersInfo.set(socket.id, {
			name: name,
			nick: nick,
			pic: pic,
		})
		console.log(`[+] Connected: ${usersInfo.get(socket.id).name} - SSID: ${ssid}`)

		if (collaborationSessions.has(ssid)) {
			const idList = collaborationSessions.get(ssid)['userSocketId']
			idList.push(socket.id)
			broadcastUserInfo(io, ssid)
		} else {
			redisClient.get(sessionPath + ssid, (str) => {
				if (str) {
					const data = JSON.parse(str)
					console.log('[*] Redis: pull back content in session ' + ssid)
					collaborationSessions.set(ssid, {
						userSocketId: [],
						contents: data.contents,
						lang: data.lang,
					});
				} else {
					console.log('[*] Redis: No content in cache, created a new content')
					collaborationSessions.set(ssid, {
						userSocketId: [],
						contents: [],
						lang: 'java',
					})
				}
				const idList = collaborationSessions.get(ssid)['userSocketId']
				idList.push(socket.id)
				broadcastUserInfo(io, ssid)
			})
		}

		socket.on('editorChange', (delta) => {
			
			const curSsid = socketToSession.get(socket.id)
			if (collaborationSessions.has(curSsid)) {
				const curSessionData = collaborationSessions.get(curSsid)
				curSessionData.contents.push(['editorChange', delta, Date.now()])
				curSessionData.userSocketId.forEach((sid) => {
					if (sid !== socket.id) {
						io.to(sid).emit('editorChange', delta);
					}
				})

			} else {
				console.log('Error!')
			}
		})

		socket.on('cursorMove', (cursor) => {
			cursor = JSON.parse(cursor)
			cursor['socketId'] = socket.id
			const curSsid = socketToSession.get(socket.id)
			if (collaborationSessions.has(curSsid)) {
				const curSessionData = collaborationSessions.get(curSsid)
				curSessionData.userSocketId.forEach((sid) => {
					if (sid !== socket.id) {
						io.to(sid).emit('cursorMove', JSON.stringify(cursor));
					}
				})
			} else {
				console.log('Error!')
			}
		})

		socket.on('getContent', () => {
			const curSsid = socketToSession.get(socket.id)
			if (collaborationSessions.has(curSsid)) {
				const contents = collaborationSessions.get(curSsid)['contents']
				contents.forEach((action) => {
					console.log('[*] Send content...')
					io.to(socket.id).emit(action[0], action[1])
				})
				io.to(socket.id).emit('changeLang', collaborationSessions.get(curSsid)['lang'])
			}
		})

		socket.on('compiled', (data) => {
			const curSsid = socketToSession.get(socket.id)
			if (collaborationSessions.has(curSsid)) {
				const curSessionData = collaborationSessions.get(curSsid)
				const res = JSON.parse(data)
				res.user = name
				curSessionData.userSocketId.forEach((sid) => {
					if (sid !== socket.id) {
						io.to(sid).emit('compiled', JSON.stringify(res));
					}
				})
			}
		})

		socket.on('changeLang', (lang) => {
			const curSsid = socketToSession.get(socket.id)
			if (collaborationSessions.has(curSsid)) {
				const curSessionData = collaborationSessions.get(curSsid)
				curSessionData.lang = lang
				curSessionData.userSocketId.forEach((sid) => {
					if (sid !== socket.id) {
						io.to(sid).emit('changeLang', lang);
					}
				})
			}
		})

		socket.on('checkCode', (code) => {
			if (code && collaborationSessions.has(code)) {
				io.to(socket.id).emit('checkCode', true)
			}
		})

		socket.on('disconnect', () => {
			console.log('disconnect')
			const curSsid = socketToSession.get(socket.id)
			if (collaborationSessions.has(curSsid)) {
				userSocketId = collaborationSessions.get(curSsid).userSocketId
				const idx = userSocketId.indexOf(socket.id)
				if (idx != -1) {
					userSocketId.splice(idx, 1)
				}
				broadcastUserInfo(io, curSsid)

				if (userSocketId.length === 0) {
					const key = sessionPath + curSsid
					const val = JSON.stringify(collaborationSessions.get(curSsid));
					redisClient.set(key, val, () => {})
					redisClient.expire(key, TIMEOUT_IN_SECONDS);
					collaborationSessions.delete(curSsid);
				}
			}
		})
	})
}
