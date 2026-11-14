package utils

import (
	"regexp"
	"strings"
)

var (
	StepRe1 = regexp.MustCompile(`(?i)\b(\d[\d,]*)\s*steps?\b`)
	StepRe2 = regexp.MustCompile(`(?i)\bsteps?[:\s\-]+(\d[\d,]*)`)
	HrRe    = regexp.MustCompile(`(?i)(?:hr|heart\s*rate|pulse)[:\s\-]+(\d{2,3})`)
)

func ParseSteps(content string) int {
	matches := StepRe1.FindStringSubmatch(content)
	if len(matches) < 2 {
		matches = StepRe2.FindStringSubmatch(content)
	}
	if len(matches) < 2 {
		return 0
	}
	clean := strings.ReplaceAll(matches[1], ",", "")
	var total int
	for _, ch := range clean {
		if ch >= '0' && ch <= '9' {
			total = total*10 + int(ch-'0')
		}
	}
	return total
}
