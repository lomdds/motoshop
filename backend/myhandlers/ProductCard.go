package myhandlers

import (
	"net/http"
	"encoding/json"
	"strconv"
	"log"

	"gorm.io/gorm"
    "github.com/gorilla/mux"
    "github.com/form3tech-oss/jwt-go"

	"go-server/models"
)


func ProductCardHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var productCards []models.ProductCard
        if err := db.Preload("User").Find(&productCards).Error; err != nil {
            log.Printf("Error fetching products: %v", err)
            http.Error(w, "Ошибка при получении товаров: " + err.Error(), http.StatusInternalServerError)
            return
        }

        log.Printf("Returning %d product cards", len(productCards))
        for i, card := range productCards {
            log.Printf("Card %d: ID=%v, Brand=%s", i, card.ID, card.Brand)
        }

        payload, err := json.Marshal(productCards)
        if err != nil {
            log.Printf("JSON marshal error: %v", err)
            http.Error(w, "Ошибка при формировании ответа", http.StatusInternalServerError)
            return
        }
        
        w.Header().Set("Content-Type", "application/json")
        w.Write(payload)
    }
}

func CreateProductCardHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        token := r.Context().Value("user").(*jwt.Token)
        claims := token.Claims.(jwt.MapClaims)
        userID := uint(claims["user_id"].(float64)) 

        var productCard models.ProductCard
        if err := json.NewDecoder(r.Body).Decode(&productCard); err != nil {
            http.Error(w, "Неверный формат данных", http.StatusBadRequest)
            return
        }

        productCard.UserID = userID

        if productCard.Brand == "" || productCard.BikeModel == "" || productCard.Color == "" {
            http.Error(w, "Обязательные поля: марка, модель и цвет", http.StatusBadRequest)
            return
        }

        if err := db.Create(&productCard).Error; err != nil {
            http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(productCard)
    }
}

func UpdateProductCardHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id := vars["id"]

		var productCard models.ProductCard
		if err := db.First(&productCard, id).Error; err != nil {
			http.Error(w, "Карточка товара не найдена", http.StatusNotFound)
			return
		}

		var updateData models.ProductCard
		if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
			http.Error(w, "Неверный формат данных: "+err.Error(), http.StatusBadRequest)
			return
		}

		if updateData.Brand == "" || updateData.BikeModel == "" || updateData.Color == "" {
			http.Error(w, "Обязательные поля: марка, модель и цвет", http.StatusBadRequest)
			return
		}

		productCard.Brand = updateData.Brand
		productCard.BikeModel = updateData.BikeModel
		productCard.EngineCapacity = updateData.EngineCapacity
		productCard.Power = updateData.Power
		productCard.Color = updateData.Color
		productCard.Price = updateData.Price

		if err := db.Save(&productCard).Error; err != nil {
			http.Error(w, "Ошибка обновления карточки товара: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(productCard)
	}
}

func DeleteProductCardHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Delete request received. Method: %s, URL: %s", r.Method, r.URL)
		
		vars := mux.Vars(r)
		idStr := vars["id"]
		log.Printf("Received ID: %s", idStr)

		if idStr == "" {
			log.Println("Empty ID received")
			http.Error(w, `{"error": "ID карточки не указан"}`, http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(idStr)
		if err != nil {
			log.Printf("Invalid ID format: %s, error: %v", idStr, err)
			http.Error(w, `{"error": "Неверный формат ID"}`, http.StatusBadRequest)
			return
		}

		log.Printf("Attempting to delete product with ID: %d", id)
		
		var productCard models.ProductCard
		if err := db.First(&productCard, id).Error; err != nil {
			log.Printf("Product not found: %v", err)
			http.Error(w, `{"error": "Карточка не найдена"}`, http.StatusNotFound)
			return
		}

		if err := db.Delete(&productCard).Error; err != nil {
			log.Printf("Delete error: %v", err)
			http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		log.Printf("Successfully deleted product with ID: %d", id)
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message": "Карточка успешно удалена"}`))
	}
}