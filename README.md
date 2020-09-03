# syslog

:boom: [ESM] The syslog protocol (rfc5424) client. Works with Node.js over udp (rfc5426) and tcp (rfc6587)

---

![npm](https://img.shields.io/david/awesomeorganization/syslog)
![npm](https://img.shields.io/npm/v/@awesomeorganization/syslog)
![npm](https://img.shields.io/npm/dt/@awesomeorganization/syslog)
![npm](https://img.shields.io/npm/l/@awesomeorganization/syslog)
![npm](https://img.shields.io/bundlephobia/minzip/@awesomeorganization/syslog)
![npm](https://img.shields.io/bundlephobia/min/@awesomeorganization/syslog)

---

## Example

```
import { syslog } from '@awesomeorganization/syslog'

const log = await syslog({
  appName: 'Awesome App',
  host: 'syslog.local',
  port: 514,
  protocol: 'udp4',
})

log({
  message: 'Hi!',
})

log({
  message: 'Houston, we have a problem',
  severity: 'EMERGENCY',
})
```
