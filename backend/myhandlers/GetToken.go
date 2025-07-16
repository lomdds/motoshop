package myhandlers

import (
	"encoding/json"
	"net/http"
	"time"
	"log"

	"github.com/form3tech-oss/jwt-go"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	
	"go-server/models"
)

func GetTokenHandler(mySigningKey []byte, db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")

        var req struct {
            Username string `json:"username"`
            Password string `json:"password"`
        }

        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Неверный запрос"}) // Неверное тело запроса
            return
        }

        if req.Username == "" || req.Password == "" {
            w.WriteHeader(http.StatusBadRequest)
            json.NewEncoder(w).Encode(map[string]string{"error": "Требуются имя пользователя и пароль"})
            return
        }

        var user models.User
        if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
            if err == gorm.ErrRecordNotFound {
                w.WriteHeader(http.StatusUnauthorized)
                json.NewEncoder(w).Encode(map[string]string{"error": "Пользователь не найден"})
            } else {
                w.WriteHeader(http.StatusInternalServerError)
                json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка Базы Данных"})
            }
            return
        }

        if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{"error": "Неверный пароль"})
            return
        }

        token := jwt.New(jwt.SigningMethodHS256)
        claims := token.Claims.(jwt.MapClaims)
        claims["user_id"] = user.ID
        claims["username"] = user.Username
        claims["exp"] = time.Now().Add(time.Hour * 24).Unix()

        tokenString, err := token.SignedString(mySigningKey)
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": "Ошибка генерации токена"})
            return
        }

        response := map[string]interface{}{
            "token":    tokenString,
            "username": user.Username,
            "user_id":  user.ID,
        }
        
        if err := json.NewEncoder(w).Encode(response); err != nil {
            log.Printf("Failed to encode response: %v", err)
        }
    }
}