package myhandlers

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/form3tech-oss/jwt-go"

	"gorm.io/gorm"

	"go-server/models"
)

func GetTokenHandler(mySigningKey []byte, db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := r.URL.Query().Get("username")
		if username == "" {
			http.Error(w, "Username is required", http.StatusBadRequest)
			return
		}

		var user models.User
		result := db.Where("username = ?", username).First(&user)
		if result.Error != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		token := jwt.New(jwt.SigningMethodHS256)

		claims := token.Claims.(jwt.MapClaims)
		claims["user_id"] = user.ID
		claims["username"] = user.Username
		claims["email"] = user.Email
		claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

		tokenString, err := token.SignedString(mySigningKey)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"token": tokenString,
		})
	}
}