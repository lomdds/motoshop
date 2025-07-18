package myhandlers

import (
	"net/http"
	"encoding/json"

	"gorm.io/gorm"
    "github.com/gorilla/mux"
    "github.com/form3tech-oss/jwt-go"

	"go-server/models"
)


func ProductCardHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var productCards []models.ProductCard
        if err := db.Preload("User").Find(&productCards).Error; err != nil {
            http.Error(w, "Ошибка при получении товаров: " + err.Error(), http.StatusInternalServerError)
            return
        }

        payload, err := json.Marshal(productCards)
        if err != nil {
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
		vars := mux.Vars(r)
		id := vars["id"]

		var productCard models.ProductCard
		if err := db.First(&productCard, id).Error; err != nil {
			http.Error(w, "Карточка товара не найдена", http.StatusNotFound)
			return
		}

		if err := db.Delete(&productCard).Error; err != nil {
			http.Error(w, "Ошибка удаления карточки товара: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"message": "Карточка товара успешно удалена"}`))
	}
}