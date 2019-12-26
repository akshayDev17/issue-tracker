package main

import (
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"my_app/app"
	"my_app/controllers"
	"net/http"
	"os"
)

func main() {
	router := mux.NewRouter()

	cors := handlers.CORS(
		handlers.AllowedHeaders([]string{"*"}),
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowCredentials(),
		handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"}),
	)
	router.Use(cors)

	router.HandleFunc("/", controllers.GetIssuesFor).Methods("POST", "OPTIONS")
	router.HandleFunc("/register", controllers.CreateAccount).Methods("POST")
	router.HandleFunc("/login", controllers.Authenticate).Methods("POST")
	router.HandleFunc("/projects/new", controllers.CreateProject).Methods("POST")
	router.HandleFunc("/projects/all", controllers.GetProjectsFor).Methods("GET")
	router.HandleFunc("/projects/add_user", controllers.AddUserToProject).Methods("POST")
	router.HandleFunc("/issues/new", controllers.CreateIssue).Methods("POST")

	router.Use(app.JwtAuthentication) //attach JWT auth middleware

	//router.NotFoundHandler = app.NotFoundHandler

	port := os.Getenv("PORT")
	if port == "" {
		port = "12345" //localhost
	}

	fmt.Println(port)

	// headersOk := handlers.AllowedHeaders([]string{"X-Requested-With"})
	// originsOk := handlers.AllowedOrigins([]string{os.Getenv("ORIGIN_ALLOWED")})
	// methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	err := http.ListenAndServe(":"+port, router)
	if err != nil {
		fmt.Print(err)
	}
	fmt.Println("Here")
}
