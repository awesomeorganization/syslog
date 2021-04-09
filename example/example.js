/* eslint-disable node/no-unsupported-features/es-syntax */

import { syslog } from '@awesomeorganization/syslog'

const example = async () => {
  {
    const log = syslog({
      defaultStructuredData: {
        '8bf8cc10-4140-4c3e-a2b4-e6f5324f1aea@41058': {
          tag: 'tcp',
        },
      },
      host: 'logs-01.loggly.com',
      port: 514,
      protocol: 'tcp',
    })

    await log({
      message: 'Works with tcp!',
    })
  }
  {
    const log = syslog({
      defaultStructuredData: {
        '8bf8cc10-4140-4c3e-a2b4-e6f5324f1aea@41058': {
          tag: 'tls',
        },
      },
      host: 'logs-01.loggly.com',
      port: 6514,
      protocol: 'tls',
    })

    await log({
      message: 'Works with tls!',
    })
  }
}

example()
