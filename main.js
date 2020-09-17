import { createConnection } from 'net'
import { createSocket } from 'dgram'

// REFERENCES
// https://tools.ietf.org/html/rfc5424
// https://tools.ietf.org/html/rfc5426
// https://tools.ietf.org/html/rfc6587

export const FACILITIES = {
  LOCAL0: 16,
  LOCAL1: 17,
  LOCAL2: 18,
  LOCAL3: 19,
  LOCAL4: 20,
  LOCAL5: 21,
  LOCAL6: 22,
  LOCAL7: 23,
}

export const SEVERITIES = {
  ALERT: 1,
  CRITICAL: 2,
  DEBUG: 7,
  EMERGENCY: 0,
  ERROR: 3,
  INFORMATIONAL: 6,
  NOTICE: 5,
  WARNING: 4,
}

export const rfc5424 = ({
  appName = '-',
  facility = FACILITIES.LOCAL0,
  hostname = '-',
  message,
  msgId = '-',
  procId = '-',
  severity = SEVERITIES.DEBUG,
  timestamp = '-',
}) => {
  if (typeof facility === 'string') {
    facility = FACILITIES[facility.toUpperCase()] ?? FACILITIES.LOCAL0
  }
  if (typeof severity === 'string') {
    severity = SEVERITIES[severity.toUpperCase()] ?? SEVERITIES.DEBUG
  }
  return Buffer.from(`<${Math.imul(facility, 8) + severity}>1 ${timestamp} ${hostname} ${appName} ${procId} ${msgId} - ${message}`)
}

// async -> sync
export const rfc5426 = ({ appName, family, host, hostname, port }) => {
  return new Promise((resolve, reject) => {
    const options = {
      0: {
        type: 'udp6',
      },
      4: {
        type: 'udp4',
      },
      6: {
        ipv6Only: true,
        type: 'udp6',
      },
    }
    const socket = createSocket(options[family])
    socket.connect(port, host)
    socket.once('error', reject)
    socket.once('connect', () => {
      resolve(({ facility, message, msgId, procId, severity, timestamp }) => {
        socket.send(
          rfc5424({
            appName,
            facility,
            hostname,
            message,
            msgId,
            procId,
            severity,
            timestamp,
          })
        )
      })
    })
  })
}

// sync -> async
export const rfc6587 = ({ appName, family, host, hostname, port }) => {
  return ({ facility, message, msgId, procId, severity, timestamp }) => {
    return new Promise((resolve, reject) => {
      const socket = createConnection({
        family,
        host,
        port,
      })
      socket.once('error', reject)
      socket.once('end', resolve)
      socket.once('connect', () => {
        socket.end(
          rfc5424({
            appName,
            facility,
            hostname,
            message,
            msgId,
            procId,
            severity,
            timestamp,
          })
        )
      })
    })
  }
}

export const syslog = ({ appName, host = 'localhost', hostname, port = 514, protocol = 'udp4' }) => {
  switch (protocol) {
    case 'tcp': {
      return rfc6587({
        appName,
        family: 0,
        host,
        hostname,
        port,
      })
    }
    case 'tcp4': {
      return rfc6587({
        appName,
        family: 4,
        host,
        hostname,
        port,
      })
    }
    case 'tcp6': {
      return rfc6587({
        appName,
        family: 6,
        host,
        hostname,
        port,
      })
    }
    case 'udp': {
      return rfc5426({
        appName,
        family: 0,
        host,
        hostname,
        port,
      })
    }
    case 'udp4': {
      return rfc5426({
        appName,
        family: 4,
        host,
        hostname,
        port,
      })
    }
    case 'udp6': {
      return rfc5426({
        appName,
        family: 6,
        host,
        hostname,
        port,
      })
    }
    default: {
      throw Error('Unsupported syslog protocol')
    }
  }
}
