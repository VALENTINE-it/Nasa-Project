package models

import "time"

type FlightSurgeonMessage struct {
	ID        string    `json:"id"`
	From      string    `json:"from"`
	To        string    `json:"to"`
	Timestamp time.Time `json:"timestamp"`
	Subject   string    `json:"subject"`
	Body      string    `json:"body"`
	Severity  string    `json:"severity"`
}
