import docker
import os
import shutil
import uuid
import time
from docker.errors import *

client = docker.DockerClient()

IMAGE_NAME = 'yenhsuan/coj'
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
TEMP_BUILD_DIR = '%s/tmp' % CURRENT_DIR

SOURCE_FILE_NAMES = {
    "java" : "Mycode.java",
    'python' : 'mycode.py',
    'c_cpp' : 'mycode.cpp'
}

BINARY_NAMES = {
    "java" : "Mycode",
    'python' : 'mycode.py',
    'c_cpp' : 'a.out'
}

BUILD_COMMANDS = {
    "java" : "javac",
    "python" : "python -u",
    "c_cpp" : "g++ -o a.out"
}

EXECUTE_COMMANDS = {
    "java" : "java",
    "python" : "python",
    "c_cpp" : "./"
}

TIMEOUT_SETTING = 'timeout -s 2 5'
def load_image():
    try:
        client.images.get(IMAGE_NAME)
    except ImageNotFound:
        print 'image not found locally, loading from docker hub...'
        client.images.pull(IMAGE_NAME)
    except APIError:
        print 'image not found locally. docker hub is not accessible'
        return
    print 'Image: [%s] loaded' % IMAGE_NAME

def build_and_run(code, lang):
    result = {'build': None, 'run': None, 'error': None}

    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = '%s/%s' % (TEMP_BUILD_DIR, source_file_parent_dir_name)
    source_file_guest_dir = '/test/%s' % (source_file_parent_dir_name)

    make_dir(source_file_host_dir)

    with open('%s/%s' % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)

    try:
        client.containers.run(
            image=IMAGE_NAME,
            command='%s %s' % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir)
        print 'Source built'
        result['build'] = 'Compiled successfully'
    except ContainerError as e:
        print 'Build failed'
        result['build'] = e.stderr
        shutil.rmtree(source_file_host_dir)
        return result

    try:
        tmp_var='%s %s %s' % (TIMEOUT_SETTING, EXECUTE_COMMANDS[lang], BINARY_NAMES[lang])
        print tmp_var
        if EXECUTE_COMMANDS[lang]=='./':
            tmp_var='%s %s%s' % (TIMEOUT_SETTING, EXECUTE_COMMANDS[lang], BINARY_NAMES[lang])
        log = client.containers.run(
            image=IMAGE_NAME,
            command=tmp_var,
            volumes={source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir)
        result['run'] = log
    except ContainerError as e:
        print 'Execution failed'
        result['run'] = '[!] Execution Failed - Timeout'
        shutil.rmtree(source_file_host_dir)
        return result
    

    shutil.rmtree(source_file_host_dir)
    return result

def make_dir(dir):
    try:
        os.mkdir(dir)
        print 'temp build directory [%s] created.' % dir
    except OSError:
        print 'temp build directory [%s] exists.' % dir