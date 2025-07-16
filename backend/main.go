package main

import (
	"log"
	"net/http"

	"github.com/auth0/go-jwt-middleware"
	"github.com/form3tech-oss/jwt-go"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

    "go-server/myhandlers"
	"go-server/models"
	
)

var (
	db           *gorm.DB
	mySigningKey = []byte("secret")
)

var StatusHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("API is up and running"))
})

var jwtMiddleware = jwtmiddleware.New(jwtmiddleware.Options{
	ValidationKeyGetter: func(token *jwt.Token) (interface{}, error) {
		return mySigningKey, nil
	},
	SigningMethod: jwt.SigningMethodHS256,
})

func main() {
	dsn := "host=localhost user=gorm password=gorm dbname=gorm port=5432 sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Не удалось подключиться к БД:", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("Ошибка миграции:", err)
	}

	// newUser := models.User{
	// 	Username: "Jack",
	// 	Email: "Alala@gmail.com",
	// 	Password: "ololo123",
	// }

	// if err := db.Create(&newUser).Error; err != nil {
	// 	log.Fatal(":(")
	// }

	newProductCard := models.ProductCard{
		UserID: 1,
		Brand:   "BMW",
		BikeModel: "R1200 GS",
		EngineCapacity: 1200,
		Power: 186,
		Color: "White",
		Price: 1390000,
	}
	
	if err := db.Create(&newProductCard).Error; err != nil {
		log.Fatal(":(")
	}

	r := mux.NewRouter()

	r.Handle("/", http.FileServer(http.Dir("./views/")))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("./static/"))))

	r.Handle("/status", StatusHandler).Methods("GET")
	r.Handle("/get-token", http.HandlerFunc(myhandlers.GetTokenHandler(mySigningKey, db))).Methods("POST")
	r.HandleFunc("/register", myhandlers.RegisterHandler(db, mySigningKey)).Methods("POST")
	r.Handle("/products", jwtMiddleware.Handler(myhandlers.ProductCardHandler(db))).Methods("GET")


	secured := r.PathPrefix("/").Subrouter()
    secured.Use(jwtMiddleware.Handler)

	secured.HandleFunc("/cart", myhandlers.GetCartHandler(db)).Methods("GET")
    secured.HandleFunc("/cart/add", myhandlers.AddToCartHandler(db)).Methods("POST")
	secured.HandleFunc("/cart/items/{id}", myhandlers.RemoveFromCartHandler(db)).Methods("DELETE")
	secured.HandleFunc("/cart/items/{id}", myhandlers.UpdateCartItemHandler(db)).Methods("PUT")
	secured.HandleFunc("/cart/clear", myhandlers.ClearCartHandler(db)).Methods("DELETE")

	log.Println("Server starting on :3002")

	http.ListenAndServe(":3002", handlers.CORS(
    	handlers.AllowedOrigins([]string{"http://localhost:3000"}),
    	handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
    	handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
    	handlers.AllowCredentials(),
	)(r))
}