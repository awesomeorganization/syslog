import { FACILITIES, SEVERITIES, rfc5424, syslog } from '../main.js'

import { deepStrictEqual } from 'assert'
import { createServer as tcp } from 'net'
import { createSocket as udp } from 'dgram'

const APPNAME = 'APPNAME'
const MESSAGE = 'MESSAGE'
const TESTS = 100

let QUEUE_TESTS = TESTS * 4

const messageListener = (message) => {
  deepStrictEqual(
    message,
    rfc5424({
      appName: APPNAME,
      eol: '\0',
      facility: FACILITIES.LOCAL0,
      hostname: '-',
      message: MESSAGE,
      msgId: '-',
      procId: '-',
      severity: SEVERITIES.DEBUG,
      structuredData: '-',
      timestamp: '-',
    })
  )
  if (--QUEUE_TESTS === 0) {
    // eslint-disable-next-line no-process-exit
    process.exit()
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

const udp4 = udp(
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
      defaultAppName: APPNAME,
      defaultEol: '\0',
      defaultFacility: FACILITIES.LOCAL0,
      defaultHostname: '-',
      defaultMsgId: '-',
      defaultProcId: '-',
      defaultSeverity: SEVERITIES.DEBUG,
      defaultStructuredData: '-',
      host: '127.0.0.1',
      port: 3001,
      protocol: 'udp4',
    })
    for (let i = 0; i !== TESTS; i++) {
      log({
        message: MESSAGE,
        timestamp: '-',
      })
    }
  }
)

const udp6 = udp(
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
      defaultAppName: APPNAME,
      defaultEol: '\0',
      defaultFacility: FACILITIES.LOCAL0,
      defaultHostname: '-',
      defaultMsgId: '-',
      defaultProcId: '-',
      defaultSeverity: SEVERITIES.DEBUG,
      defaultStructuredData: '-',
      host: '::1',
      port: 3002,
      protocol: 'udp6',
    })
    for (let i = 0; i !== TESTS; i++) {
      log({
        message: MESSAGE,
        timestamp: '-',
      })
    }
  }
)

const tcp4 = tcp(tcpMessageListener)
tcp4.listen(
  {
    host: '127.0.0.1',
    port: 3003,
  },
  async () => {
    console.log('tcp4', tcp4.address())
    const log = syslog({
      defaultAppName: APPNAME,
      defaultEol: '\0',
      defaultFacility: FACILITIES.LOCAL0,
      defaultHostname: '-',
      defaultMsgId: '-',
      defaultProcId: '-',
      defaultSeverity: SEVERITIES.DEBUG,
      defaultStructuredData: '-',
      host: '127.0.0.1',
      port: 3003,
      protocol: 'tcp4',
    })
    for (let i = 0; i !== TESTS; i++) {
      await log({
        message: MESSAGE,
        timestamp: '-',
      })
    }
  }
)

const tcp6 = tcp(tcpMessageListener)
tcp6.listen(
  {
    host: '::1',
    ipv6Only: true,
    port: 3004,
  },
  async () => {
    console.log('tcp6', tcp6.address())
    const log = syslog({
      defaultAppName: APPNAME,
      defaultEol: '\0',
      defaultFacility: FACILITIES.LOCAL0,
      defaultHostname: '-',
      defaultMsgId: '-',
      defaultProcId: '-',
      defaultSeverity: SEVERITIES.DEBUG,
      defaultStructuredData: '-',
      host: '::1',
      port: 3004,
      protocol: 'tcp6',
    })
    for (let i = 0; i !== TESTS; i++) {
      await log({
        message: MESSAGE,
        timestamp: '-',
      })
    }
  }
)
