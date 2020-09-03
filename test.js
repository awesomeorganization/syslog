import { rfc5424, syslog } from './main.js'

import { createServer } from 'net'
import { createSocket } from 'dgram'
import { deepStrictEqual } from 'assert'

const APPNAME = 'TestAppName'
const MESSAGE = 'Testing...'
const TESTS = 100

let QUEUE_TESTS = TESTS * 4

const messageListener = (message) => {
  deepStrictEqual(
    message,
    rfc5424({
      appName: APPNAME,
      message: MESSAGE,
    })
  )
  if (--QUEUE_TESTS === 0) {
    process.exit(0)
  }
}

const tcpMessageListener = (socket) => {
  const chunks = []
  socket.on('data', (chunk) => {
    chunks.push(chunk)
  })
  socket.on('end', () => {
    const message = Buffer.concat(chunks)
    messageListener(message)
  })
}

const udp4 = createSocket(
  {
    type: 'udp4',
  },
  messageListener
)
udp4.bind(
  {
    address: '127.0.0.1',
    port: 3001,
  },
  async () => {
    console.log('udp4', udp4.address())
    const log = await syslog({
      appName: APPNAME,
      host: '127.0.0.1',
      port: 3001,
      protocol: 'udp4',
    })
    for (let i = 0; i !== TESTS; i++) {
      log({
        message: MESSAGE,
      })
    }
  }
)

const udp6 = createSocket(
  {
    ipv6Only: true,
    type: 'udp6',
  },
  messageListener
)
udp6.bind(
  {
    address: '::1',
    port: 3002,
  },
  async () => {
    console.log('udp6', udp6.address())
    const log = await syslog({
      appName: APPNAME,
      host: '::1',
      port: 3002,
      protocol: 'udp6',
    })
    for (let i = 0; i !== TESTS; i++) {
      log({
        message: MESSAGE,
      })
    }
  }
)

const tcp4 = createServer(tcpMessageListener)
tcp4.listen(
  {
    host: '127.0.0.1',
    port: 3003,
  },
  async () => {
    console.log('tcp4', tcp4.address())
    const log = syslog({
      appName: APPNAME,
      host: '127.0.0.1',
      port: 3003,
      protocol: 'tcp4',
    })
    for (let i = 0; i !== TESTS; i++) {
      await log({
        message: MESSAGE,
      })
    }
  }
)

const tcp6 = createServer(tcpMessageListener)
tcp6.listen(
  {
    host: '::1',
    ipv6Only: true,
    port: 3004,
  },
  async () => {
    console.log('tcp6', tcp6.address())
    const log = syslog({
      appName: APPNAME,
      host: '::1',
      port: 3004,
      protocol: 'tcp6',
    })
    for (let i = 0; i !== TESTS; i++) {
      await log({
        message: MESSAGE,
      })
    }
  }
)
