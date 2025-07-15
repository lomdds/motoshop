package myhandlers

import (
	"net/http"
	"encoding/json"

	"gorm.io/gorm"

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