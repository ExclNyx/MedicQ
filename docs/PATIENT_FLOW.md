# MedicQ Patient Flow

1. Patient creates a Firebase Authentication account.
2. Patient completes identity data in `patients/{uid}`.
3. Patient lands on `patient-access`, not the patient dashboard.
4. Patient creates today's registration in `registrations` with `REGISTRATION_PENDING`.
5. Staff verifies identity and records complaint.
6. Staff selects the service/poli and `assignQueue()` creates the queue in `queues` and changes registration to `QUEUED`.
7. The patient's `patient-access` listener detects `queueId` and automatically redirects to `/(patient)/home`.
8. The patient home listens to Firestore in real time and shows the patient's number, current serving number, position, and up to three queue numbers ahead.
9. Calling the next patient changes that queue to `CALLED`, displayed to the patient as `Sedang Dilayani`. The previously active queue is automatically `COMPLETED` when the next number is called.
10. Recall increments `callCount`, so the patient receives a fresh notification.
11. No-show/skip does not issue a new number. The called queue keeps its number, returns to `WAITING`, receives a larger `queueOrder`, and therefore waits behind patients already in line.
