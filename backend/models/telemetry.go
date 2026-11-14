package models

import "time"

type WearableLiveState struct {
	IsConnected bool      `json:"isConnected"`
	DeviceName  string    `json:"deviceName"`
	HeartRate   int       `json:"heartRate"`
	Steps       int       `json:"steps"`
	SpO2        int       `json:"spO2"`
	LastSeen    time.Time `json:"lastSeen"`
	RawText     string    `json:"rawText"`
}
