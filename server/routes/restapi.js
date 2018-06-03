const express = require('express')
const router = express.Router()

const bodyParser=require('body-parser')
const jsonParser=bodyParser.json()

const nodeRestClient = require('node-rest-client').Client
const restClient = new nodeRestClient()

EXECUTOR_SERVER_URL = "http://localhost:5000/build_and_run"
restClient.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST')

router.post('/build',jsonParser,(req,res)=>{
	const userCode = req.body.userCode
	const lang = req.body.lang
	console.log(`(Build) received: ${userCode}`)

	restClient.methods.build_and_run(
		{
			data:{
				code: userCode,
				lang: lang
			},
			headers: {'Content-Type': 'application/json'}
		},
		(result, response) => {
			console.log(`Execution: ${JSON.stringify(result)}`)
			const text = `Build results:\n${result['build']}\n\nExecute output:\n${result['run']}\n\n\n\n`
			const compiledResult = {}
			compiledResult['run'] = result['run']
			compiledResult['build'] = result['build']
			compiledResult['text'] = text
			res.json(compiledResult)
		}
	)

})

module.exports = router
