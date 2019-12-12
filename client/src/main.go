package main

import (
	"net/http"
	"fmt"
)

func login(w http.ResponseWriter, r *http.Request){
	if r.Method == "POST" {
		fmt.Fprintf(w, "<h1>Hello World</h1>")
	}
}

func main() {
	http.HandleFunc("/", login)
	http.ListenAndServe(":12345", nil)
}