import { FACILITIES, SEVERITIES, rfc5424, syslog } from '../main.js'
import { tcp, tls, udp } from '@awesomeorganization/servers'

import { deepStrictEqual } from 'assert'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const cert = `-----BEGIN CERTIFICATE-----
MIID2jCCA0MCAg39MA0GCSqGSIb3DQEBBQUAMIGbMQswCQYDVQQGEwJKUDEOMAwG
A1UECBMFVG9reW8xEDAOBgNVBAcTB0NodW8ta3UxETAPBgNVBAoTCEZyYW5rNERE
MRgwFgYDVQQLEw9XZWJDZXJ0IFN1cHBvcnQxGDAWBgNVBAMTD0ZyYW5rNEREIFdl
YiBDQTEjMCEGCSqGSIb3DQEJARYUc3VwcG9ydEBmcmFuazRkZC5jb20wHhcNMTIw
ODIyMDUyODAwWhcNMTcwODIxMDUyODAwWjBKMQswCQYDVQQGEwJKUDEOMAwGA1UE
CAwFVG9reW8xETAPBgNVBAoMCEZyYW5rNEREMRgwFgYDVQQDDA93d3cuZXhhbXBs
ZS5jb20wggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCwvWITOLeyTbS1
Q/UacqeILIK16UHLvSymIlbbiT7mpD4SMwB343xpIlXN64fC0Y1ylT6LLeX4St7A
cJrGIV3AMmJcsDsNzgo577LqtNvnOkLH0GojisFEKQiREX6gOgq9tWSqwaENccTE
sAXuV6AQ1ST+G16s00iN92hjX9V/V66snRwTsJ/p4WRpLSdAj4272hiM19qIg9zr
h92e2rQy7E/UShW4gpOrhg2f6fcCBm+aXIga+qxaSLchcDUvPXrpIxTd/OWQ23Qh
vIEzkGbPlBA8J7Nw9KCyaxbYMBFb1i0lBjwKLjmcoihiI7PVthAOu/B71D2hKcFj
Kpfv4D1Uam/0VumKwhwuhZVNjLq1BR1FKRJ1CioLG4wCTr0LVgtvvUyhFrS+3PdU
R0T5HlAQWPMyQDHgCpbOHW0wc0hbuNeO/lS82LjieGNFxKmMBFF9lsN2zsA6Qw32
Xkb2/EFltXCtpuOwVztdk4MDrnaDXy9zMZuqFHpv5lWTbDVwDdyEQNclYlbAEbDe
vEQo/rAOZFl94Mu63rAgLiPeZN4IdS/48or5KaQaCOe0DuAb4GWNIQ42cYQ5TsEH
Wt+FIOAMSpf9hNPjDeu1uff40DOtsiyGeX9NViqKtttaHpvd7rb2zsasbcAGUl+f
NQJj4qImPSB9ThqZqPTukEcM/NtbeQIDAQABMA0GCSqGSIb3DQEBBQUAA4GBAIAi
gU3My8kYYniDuKEXSJmbVB+K1upHxWDA8R6KMZGXfbe5BRd8s40cY6JBYL52Tgqd
l8z5Ek8dC4NNpfpcZc/teT1WqiO2wnpGHjgMDuDL1mxCZNL422jHpiPWkWp3AuDI
c7tL1QjbfAUHAQYwmHkWgPP+T2wAv0pOt36GgMCM
-----END CERTIFICATE-----`

const key = `-----BEGIN RSA PRIVATE KEY-----
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
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
          log({
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
