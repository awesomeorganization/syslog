/* eslint-disable node/no-unsupported-features/es-syntax */

// REFERENCES
// https://tools.ietf.org/html/rfc5424
// https://tools.ietf.org/html/rfc5425
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

const isObject = (value) => {
  return typeof value === 'object' && Array.isArray(value) === false
}

const parseStructuredData = (structuredData) => {
  let result = ''
  for (const id in structuredData) {
    if (isObject(structuredData[id]) === true) {
      result += `[${id}`
      for (const param in structuredData[id]) {
        result += ` ${param}="${structuredData[id][param]}"`
      }
      result += ']'
    }
  }
  return result.length === 0 ? '-' : result
}

export const rfc5424 = ({ appName, eol, facility, hostname, message, msgId, procId, severity, structuredData, timestamp }) => {
  if (typeof facility === 'string') {
    facility = FACILITIES[facility.toUpperCase()] ?? FACILITIES.LOCAL0
  }
  if (typeof severity === 'string') {
    severity = SEVERITIES[severity.toUpperCase()] ?? SEVERITIES.DEBUG
  }
  if (isObject(structuredData) === true) {
    structuredData = parseStructuredData(structuredData)
  }
  const priority = Math.imul(facility, 8) + severity
  return Buffer.from(`<${priority}>1 ${timestamp} ${hostname} ${appName} ${procId} ${msgId} ${structuredData} ${message}${eol}`)
}

export const rfc5425 = ({
  defaultAppName,
  defaultEol,
  defaultFacility,
  defaultHostname,
  defaultMsgId,
  defaultProcId,
  defaultSeverity,
  defaultStructuredData,
  ca,
  cert,
  family,
  host,
  key,
  port,
}) => {
  return async ({
    appName = defaultAppName,
    eol = defaultEol,
    facility = defaultFacility,
    hostname = defaultHostname,
    message,
    msgId = defaultMsgId,
    procId = defaultProcId,
    severity = defaultSeverity,
    structuredData = defaultStructuredData,
    timestamp = new Date().toISOString(),
  }) => {
    const { connect } = await import('tls')
    return new Promise((resolve, reject) => {
      const options = {
        ca,
        cert,
        family,
        host,
        key,
        port,
      }
      const socket = connect(options)
      socket.once('error', reject)
      socket.once('end', resolve)
      socket.once('connect', () => {
        socket.end(
          rfc5424({
            appName,
            eol,
            facility,
            hostname,
            message,
            msgId,
            procId,
            severity,
            structuredData,
            timestamp,
          })
        )
      })
    })
  }
}

export const rfc5426 = async ({
  defaultAppName,
  defaultEol,
  defaultFacility,
  defaultHostname,
  defaultMsgId,
  defaultProcId,
  defaultSeverity,
  defaultStructuredData,
  family,
  host,
  port,
}) => {
  const { createSocket } = await import('dgram')
  return new Promise((resolve, reject) => {
    const options = {
      0: {
        ipv6Only: false,
        type: 'udp6',
      },
      4: {
        ipv6Only: false,
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
      resolve(
        ({
          appName = defaultAppName,
          eol = defaultEol,
          facility = defaultFacility,
          hostname = defaultHostname,
          message,
          msgId = defaultMsgId,
          procId = defaultProcId,
          severity = defaultSeverity,
          structuredData = defaultStructuredData,
          timestamp = new Date().toISOString(),
        }) => {
          return new Promise((callback) => {
            socket.send(
              rfc5424({
                appName,
                eol,
                facility,
                hostname,
                message,
                msgId,
                procId,
                severity,
                structuredData,
                timestamp,
              }),
              callback
            )
          })
        }
      )
    })
  })
}

export const rfc6587 = ({
  defaultAppName,
  defaultEol,
  defaultFacility,
  defaultHostname,
  defaultMsgId,
  defaultProcId,
  defaultSeverity,
  defaultStructuredData,
  family,
  host,
  port,
}) => {
  return async ({
    appName = defaultAppName,
    eol = defaultEol,
    facility = defaultFacility,
    hostname = defaultHostname,
    message,
    msgId = defaultMsgId,
    procId = defaultProcId,
    severity = defaultSeverity,
    structuredData = defaultStructuredData,
    timestamp = new Date().toISOString(),
  }) => {
    const { createConnection } = await import('net')
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
            eol,
            facility,
            hostname,
            message,
            msgId,
            procId,
            severity,
            structuredData,
            timestamp,
          })
        )
      })
    })
  }
}

export const syslog = ({
  ca,
  cert,
  defaultAppName = process.argv[process.argv.length - 1],
  defaultEol = '\0',
  defaultFacility = FACILITIES.LOCAL0,
  defaultHostname = '-',
  defaultMsgId = '-',
  defaultProcId = process.pid,
  defaultSeverity = SEVERITIES.DEBUG,
  defaultStructuredData = '-',
  host = 'localhost',
  port = 514,
  key,
  protocol = 'tcp',
}) => {
  switch (protocol) {
    case 'tls': {
      return rfc5425({
        ca,
        cert,
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 0,
        host,
        key,
        port,
      })
    }
    case 'tls4': {
      return rfc5425({
        ca,
        cert,
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 4,
        host,
        key,
        port,
      })
    }
    case 'tls6': {
      return rfc5425({
        ca,
        cert,
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 6,
        host,
        key,
        port,
      })
    }
    case 'tcp': {
      return rfc6587({
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 0,
        host,
        port,
      })
    }
    case 'tcp4': {
      return rfc6587({
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 4,
        host,
        port,
      })
    }
    case 'tcp6': {
      return rfc6587({
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 6,
        host,
        port,
      })
    }
    case 'udp': {
      return rfc5426({
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 0,
        host,
        port,
      })
    }
    case 'udp4': {
      return rfc5426({
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 4,
        host,
        port,
      })
    }
    case 'udp6': {
      return rfc5426({
        defaultAppName,
        defaultEol,
        defaultFacility,
        defaultHostname,
        defaultMsgId,
        defaultProcId,
        defaultSeverity,
        defaultStructuredData,
        family: 6,
        host,
        port,
      })
    }
    default: {
      throw Error('Unsupported protocol')
    }
  }
}
