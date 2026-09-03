# ACTIVITY-LOG-002 — Device Context Label Audit

## Finding
The activity log stores an application-generated stable `device_id`; it is not an operating-system hardware serial number.

## Decision
The table heading is therefore explicitly **معرّف الجهاز** rather than **رقم الجهاز**. Network/location context remains separately labeled **المكان / الشبكة** and is derived from timezone and, when available, request IP metadata.

## Scope
Presentation-only terminology correction. No database, financial, authentication, audit semantics, or mutation behavior changed.
