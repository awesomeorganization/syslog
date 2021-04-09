/* eslint-disable node/no-unsupported-features/es-syntax */

import { FACILITIES, SEVERITIES, rfc5424, syslog } from '../main.js'
import { tcp, tls, udp } from '@awesomeorganization/servers'

import { deepStrictEqual } from 'assert'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const cert = `-----BEGIN CERTIFICATE-----
MIIDlTCCAn2gAwIBAgIJAIiA2UzhbmG1MA0GCSqGSIb3DQEBCwUAMGMxCzAJBgNV
BAYTAlJVMQ8wDQYDVQQIEwZNb3Njb3cxDzANBgNVBAcTBk1vc2NvdzEeMBwGA1UE
ChMVIEF3ZXNvbWUgT3JnYW5pemF0aW9uMRIwEAYDVQQDEwlsb2NhbGhvc3QwHhcN
MjEwNDA4MTMyNDMwWhcNMzEwNDA5MTMyNDMwWjBjMQswCQYDVQQGEwJSVTEPMA0G
A1UECBMGTW9zY293MQ8wDQYDVQQHEwZNb3Njb3cxHjAcBgNVBAoTFSBBd2Vzb21l
IE9yZ2FuaXphdGlvbjESMBAGA1UEAxMJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0B
AQEFAAOCAQ8AMIIBCgKCAQEA16RGziyQFoHtUTcboct0NC5FiNZVw67S8/Ti5Iil
WJQMF3GV8tL4o42lN7PoexMzgU9tYo4vvgtWGWS+8W7luw9LiAaqjNjKr6lOE8go
8P7eQckOskt8bDorIFtPKUUJtwFgn0DEbotzRLjc4SBUEkwyb+n1Pli9rKxOuMX0
Zjz2HtSa1tMfp1Fg0FCgJS6MgUL9g3e2Mf7mcW5vsfF4jgUzZHJXfsfopr+nu0Ds
2EvQfrFs3UVo76/PCHJPTIzkfgCgCXjgCjhHbwX1j0KqsiAbGjqzgeFe3KmzkUGS
rJAcpIHhdDVtyDqOeB/mwvqFBvx51pi0afwR4j03lQyM/QIDAQABo0wwSjAJBgNV
HRMEAjAAMBEGCWCGSAGG+EIBAQQEAwIE8DALBgNVHQ8EBAMCBaAwHQYDVR0lBBYw
FAYIKwYBBQUHAwIGCCsGAQUFBwMBMA0GCSqGSIb3DQEBCwUAA4IBAQBul441QXh8
mlCuyQ/1qB0p5X64hIHc02bLvUgajSMXNO4Nwt0T48z2Qh4kKjiya8/Uiu5O8JH1
Q0qvKt4VIAUmEKsI0f+N4WkgFbxSdPR6Ns9s7NtfG7ttaKHcF0+yss2GKa2ZNBl4
n4pMW4rl9k0raUjvoNIkNkmVgEP4Wj7WxteWID1pSj7J7HywJT8Qxf+yAic0ic6s
skFrJ7PTdzOHkEi1GSr8S/4N37kMq6u8oZLR35nuKFS8OVRRSuKmqY4iyVTZoCqS
RPFA2Q4jEzgvVWarYQ16YyifB8mnZipztUMsA1TceIQ9fbYKlBUo9EENWpF4itFI
1OgQXUsQmCyg
-----END CERTIFICATE-----`

const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEpgIBAAKCAQEA16RGziyQFoHtUTcboct0NC5FiNZVw67S8/Ti5IilWJQMF3GV
8tL4o42lN7PoexMzgU9tYo4vvgtWGWS+8W7luw9LiAaqjNjKr6lOE8go8P7eQckO
skt8bDorIFtPKUUJtwFgn0DEbotzRLjc4SBUEkwyb+n1Pli9rKxOuMX0Zjz2HtSa
1tMfp1Fg0FCgJS6MgUL9g3e2Mf7mcW5vsfF4jgUzZHJXfsfopr+nu0Ds2EvQfrFs
3UVo76/PCHJPTIzkfgCgCXjgCjhHbwX1j0KqsiAbGjqzgeFe3KmzkUGSrJAcpIHh
dDVtyDqOeB/mwvqFBvx51pi0afwR4j03lQyM/QIDAQABAoIBAQCuyPibJIOluqog
qgo7mi0WHms9/nyFn65dDqDZm+hpY5ZpaiegKmBeMPE5tRk6qNWWekqvF5Ca+ZVP
/9jE2J5cgIk4OC8E+rNOrmwanKKStAJyUAUZfxXao0tRbrE7Qjodm4A1lMmi0GUd
zrk5wHpkWl6HV5rwbf1PeFpWah0uv73aC00zweXzJVoCq+eZChhpmabzLRO+slUy
7VACzpwgJnPeuIJGNzXE9jCExzwRkl/auFm4wM5c9WXehpTB3EwYVtJfoMlgu4KE
Qh9TlngtBZt5/OYPZbxatMve5gbOfCq1UJlWntEGi1AJd+jBLIeYHdgO3mstq3QH
zwDel1ABAoGBAOxDs7nWZQ4ocK+g/Tm5227rVoDWqrfmIyAOaNE8hiVJhahtXoyq
4W6cJtGHLvWc9AXxU4LqWs0XKVNbG+xeVlaro8od1X/Z/IY02lSjW0dOXhbsvPVw
nIKErk2Wr70d4aQoQ37x6wYU+xJcapQn7iqcXgm7CDHkWjbKvIVx5cxFAoGBAOmn
k21X884AXYtc8goseR9+28B39kpEvDgE8AOzk0XHkfPOxF2l+Z50fILzVr4NURNv
BhDiIhexVgueoHjJ49OVH95LUISThojI8/BkjPXg/h60d7pOlyfoZowhMRzcZHq2
3mQrqJhArrh2CoRL/JSwJP3FjrAcp9yyA24P6XVZAoGBAKmDZbbnIThIQZlxK144
gD0T8subuX8aSodcb034W9Ly7kfKuLS6geXneV6J3GJyyw5ceGuMk7tka80XqHAt
u0qR+YExaJZDo4/y6dciIYKGsrFGB8kdk919LsYSYGKSxusNzGePUO3bLcydrAZC
o/nEmR/oJlgNm8CGMz6XWqX1AoGBAK5BF6X4bg84HouM6cXEnSBsD59e2ANTd7uf
kxBvoGnuCF932OKuoZcW8LUInaxnagvARRnaS+q3iqBn0O3EQ3DMSlQSfx4gl7jz
hVnG44mMHnjvxkrfycMtgy0GpAYOJ7GNKBY0qSvDMYrIHdfEg76wDyZja6LT/CyP
ZhdzLn0hAoGBAItbaHy1T0UMD07ocKO/1bgzvPozbAiIF/L4TvW5Vt21Uvv4Cbq2
Vdn937sOFHGPVbRUJ8Y9KOhhl7iaO4WH9EdxSPTEMWHEbsZoaKgvgtAT/sYAIKfp
UJeqNxeR9YN60iLw6jJpM2mq11sa4pnGh53ISP1uWkqVLMgXIvJPFzuQ
-----END RSA PRIVATE KEY-----`

const message = 'MESSAGE'

const expectedMessage = rfc5424({
  appName: process.argv[process.argv.length - 1],
  eol: '\0',
  facility: FACILITIES.LOCAL0,
  hostname: '-',
  message,
  msgId: '-',
  procId: process.pid,
  severity: SEVERITIES.DEBUG,
  structuredData: '-',
  timestamp: '-',
})

let counter = 60

const assertMessage = (actualMessage) => {
  deepStrictEqual(actualMessage, expectedMessage)
  if (--counter === 0) {
    // eslint-disable-next-line no-process-exit
    process.exit()
  }
}

const assertData = (stream) => {
  const chunks = []
  stream.on('data', (chunk) => {
    chunks.push(chunk)
  })
  stream.once('end', () => {
    const actualMessage = Buffer.concat(chunks)
    assertMessage(actualMessage)
  })
}

const test = () => {
  for (const { host, ipv6Only } of [
    { host: '127.0.0.1', ipv6Only: false },
    { host: '::1', ipv6Only: true },
  ]) {
    tcp({
      listenOptions: {
        host,
        ipv6Only,
        port: 0,
      },
      onConnection(connection) {
        assertData(connection)
      },
      async onListening() {
        const { address, port } = this.address()
        const log = await syslog({
          host: address,
          port,
          protocol: `tcp${ipv6Only === true ? '6' : '4'}`,
        })
        for (let i = 0; i !== 10; i++) {
          await log({
            message,
            timestamp: '-',
          })
        }
      },
    })
    tls({
      createOptions: {
        cert,
        key,
      },
      listenOptions: {
        host,
        ipv6Only,
        port: 0,
      },
      async onListening() {
        const { address, port } = this.address()
        const log = await syslog({
          host: address,
          port,
          protocol: `tls${ipv6Only === true ? '6' : '4'}`,
        })
        for (let i = 0; i !== 10; i++) {
          await log({
            message,
            timestamp: '-',
          })
        }
      },
      onSecureConnection(connection) {
        assertData(connection)
      },
    })
    udp({
      createOptions: {
        ipv6Only,
        type: ipv6Only === true ? 'udp6' : 'udp4',
      },
      listenOptions: {
        host,
        port: 0,
      },
      async onListening() {
        const { address, port } = this.address()
        const log = await syslog({
          host: address,
          port,
          protocol: `udp${ipv6Only === true ? '6' : '4'}`,
        })
        for (let i = 0; i !== 10; i++) {
          await log({
            message,
            timestamp: '-',
          })
        }
      },
      onMessage(message) {
        assertMessage(message)
      },
    })
  }
}

test()
