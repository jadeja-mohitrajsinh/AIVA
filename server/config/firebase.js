/*=================================================================
* Project: AIVA-WEB
* File: firebase.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Firebase configuration and initialization for cloud services
* and storage integration.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import admin from 'firebase-admin';

// Service account credentials
const serviceAccount = {
  "type": "service_account",
  "project_id": "aiva-dash",
  "private_key_id": "66405e70b79ebd8142a697d7e9496f70cb88594b",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCnghAeZCL4RdDU\njy3auVIkL4vwqcLaq7mpQHfRJOofIcHF2hPaZjgEvWfuRB6VeULlf7/l44j/BXcb\nCJ0dzWqYFMNGUqmPkPi5GZPAoQh59VzBuSu1ovLuP3qSGtR8rUJ/PtcQtS2QmmN2\nMYYVo+VrG9XobnEPsYFDuMtlwAuJTslVAuqFA7aTkzb/zGIVuwjArO9PfCF7GFVK\nF3duQ0ft5v0tYHlMDt6r3XU7PP6Fg9kI4aM5JvjEUwGSNrH7FkHlZtcAF8Sr0gcC\nrMEydvPUfXdyi57lhCil4XuB5qi7HSzuQASAnTt8uP+hnPSWjRrfD87DkQF3gYxJ\nXgf3u7VNAgMBAAECggEADOzjU4UEkcXJXG2D60m7heFJWhOvXnI7zEyWMkQ38JkJ\nO7wdJhAXKH55A5CsD3qg59aYtyN8kbkZPLPIc+FC5WNMwiNkxBg6qQXJOebzIX4G\nX0hrkAN33Vx2l8mMNeakp+7wZ3CjiHHxVNBzeT4BWOd39Qx4mu5mfBRJVZuhCEI0\n4HPpweCxUE6eoS6WCC7V5ba//9yupIzM9gHUwvmAEY7tHgexCvJJxTgy1ebc6GLl\nLUmaMIz4SuMYcw8tw8w1MpwvWuY8zA+tpJhcLU7X2rIIURSsju0cbsYVqk1sK/qo\n6tXSpMtIdC8L6Qlj7tRqD9X+jD+BblXo6OBKvFuYoQKBgQC25ZUz1VLlHLvMXTEK\ne9uOgQ7GfmEObt5boFHQTzDI2AClFJEaKVLpAukb+zggZXkNxvC32r10s00z6k3r\nFA1VoYjfX5hDTbHfrszcWb6UsRir04WX7cMYdiOeJGQamOFgdRQLU0DI6+OY4n6+\n/gkRBQWbhck3vJ8rViaPGko1KQKBgQDqdd5Jzpk339Y0bZf9gQYZRyC6/BnIhOOW\nMuuHy67eTeOTh8j9TMj76VkvyOspL7HSLwTxIc743FrvHBuPhbA7WOgk7h+kFHH5\npuVfa+FER+YI+GyOjl+/cuRd05vXuBX9GMyGYkQI5GL9JJoI1X+wviTO8fHSPiHY\n7+p+jXE/hQKBgQCOGVWQzf73rxlhsE333T86Op8mLO5vbkgoXCj0dXJruRbXK2GJ\nN+4Ix5Ahg0+aK/yfbZ982OA1mVE0MqiTKiMqErTrB7SfJfA63+6ejMN7dxS5+z9i\nSQI5MSB/L7ruxzTj4lLOccJ12IAeOmtLLMgShxpSOOGbAluQKgEPUdex8QKBgQC4\nT4Y6ISYDbXvXZRvpVcc0kdyiAVJHdmfuiALtkmnaKgKv1DtlHDqXBZ5t2RU8IFk6\ncGoDIN+ydI8rjr3/ukmKrd54QZUwCD580f1YYNcKNTcZcCjue++68ZeiRpopH3Zx\nq1AEiDURhHBoraBFN4iUqTUIVdwSuXMkNZ3ydEBFfQKBgQCPGKhncTRX1tNe45Xt\nWJwZ7KRjXkEN1kxIa/+zIHEQ9WQS2xkx7IC2Q8apk5caDsU57/4wqjtliHOFigo9\nJw/shzixQsssBPJxf83gYNMMz14PmXLevquECU3TWToum2oprKPqhNox2HOuLEWn\nqrtIsul4NOb5P1JE2G68cgCYYA==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-5ptji@aiva-dash.iam.gserviceaccount.com",
  "client_id": "102851979452919192525",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-5ptji%40aiva-dash.iam.gserviceaccount.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'aiva-dash.appspot.com'
  });
}

const bucket = admin.storage().bucket();

export { bucket as adminStorage }; 