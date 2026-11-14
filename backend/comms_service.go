package main

import (
	"time"
)

type CommsMessage struct {
	ID        string    `json:"id"`
	From      string    `json:"from"`
	To        string    `json:"to"`
	Timestamp time.Time `json:"timestamp"`
	Subject   string    `json:"subject"`
	Body      string    `json:"body"`
	Severity  string    `json:"severity"`
}
