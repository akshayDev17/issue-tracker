package main

import (
	"fmt"
	"my_app/app"
	"my_app/controllers"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {

	router := mux.NewRouter()

	router.HandleFunc("/register", controllers.CreateAccount).Methods("POST")
	router.HandleFunc("/login", controllers.Authenticate).Methods("POST")
	router.HandleFunc("/projects/new", controllers.CreateProject).Methods("POST")
	router.HandleFunc("/projects/all", controllers.GetProjectsFor).Methods("GET")
	router.HandleFunc("/projects/add_user", controllers.AddUserToProject).Methods("POST")
	router.HandleFunc("/issues/new", controllers.CreateIssue).Methods("POST")
	router.HandleFunc("/issues/all", controllers.GetIssuesFor).Methods("GET")

	router.Use(app.JwtAuthentication) //attach JWT auth middleware

	//router.NotFoundHandler = app.NotFoundHandler

	port := os.Getenv("PORT")
	if port == "" {
		port = "12345" //localhost
	}

	fmt.Println(port)

	err := http.ListenAndServe(":"+port, router) //Launch the app, visit localhost:8000/api
	if err != nil {
		fmt.Print(err)
	}
}
