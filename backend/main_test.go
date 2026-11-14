package main

import (
	"regexp"
	"strings"
	"testing"
)

func TestExtractSteps(t *testing.T) {
	cases := []struct {
		input    string
		expected int
	}{
		{"1270 Steps", 1270},
		{"[not_text] 27 Steps", 27},
		{"Steps: 4,120", 4120},
		{"0 Steps", 0},
	}
	re1 := regexp.MustCompile(`(?i)\b(\d[\d,]*)\s*steps?\b`)
	re2 := regexp.MustCompile(`(?i)\bsteps?[:\s\-]+(\d[\d,]*)`)
	for _, c := range cases {
		m := re1.FindStringSubmatch(c.input)
		if len(m) < 2 {
			m = re2.FindStringSubmatch(c.input)
		}
		var val int
		if len(m) >= 2 {
			clean := strings.ReplaceAll(m[1], ",", "")
			for _, ch := range clean {
				if ch >= '0' && ch <= '9' {
					val = val*10 + int(ch-'0')
				}
			}
		}
		if val != c.expected {
			t.Errorf("For %q expected %d, got %d", c.input, c.expected, val)
		}
	}
}
