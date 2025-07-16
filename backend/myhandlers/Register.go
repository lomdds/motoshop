package myhandlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
	
	"github.com/form3tech-oss/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	
	"go-server/models"
)

func RegisterHandler(db *gorm.DB, mySigningKey []byte) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var req struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Неправильный формат запроса"})
			return
		}

		var existingUser models.User
		if err := db.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser).Error; err == nil {
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"error": "Имя пользователя или Emaail уже существуют"})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка шиффрования пароля"})
			return
		}

		newUser := models.User{
			Username: req.Username,
			Email:    req.Email,
			Password: string(hashedPassword),
		}

		if err := db.Create(&newUser).Error; err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка создания пользователя"})
			return
		}

		token := jwt.New(jwt.SigningMethodHS256)
		claims := token.Claims.(jwt.MapClaims)
		claims["user_id"] = newUser.ID
		claims["username"] = newUser.Username		// Формируем успешный ответ
		claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

		tokenString, err := token.SignedString(mySigningKey)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка генерации токена"})
			return
		}

		response := map[string]interface{}{
			"token":    tokenString,
			"username": newUser.Username,
			"user_id":  newUser.ID,
			"message":  "Пользователь успешно зарегистрирован",
		}

		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Failed to encode response: %v", err)
		}
	}
}