# syslog

:boom: [ESM] The syslog protocol (rfc5424) client. Works with Node.js over udp (rfc5426), tcp (rfc6587) and tls (rfc5425)

---

![npm](https://img.shields.io/david/awesomeorganization/syslog)
![npm](https://img.shields.io/npm/v/@awesomeorganization/syslog)
![npm](https://img.shields.io/npm/dt/@awesomeorganization/syslog)
![npm](https://img.shields.io/npm/l/@awesomeorganization/syslog)
![npm](https://img.shields.io/bundlephobia/minzip/@awesomeorganization/syslog)
![npm](https://img.shields.io/bundlephobia/min/@awesomeorganization/syslog)

---

## Example

Full example in `/example` folder.

```
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
```
