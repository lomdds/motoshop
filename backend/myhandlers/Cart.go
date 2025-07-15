package myhandlers

import (
	"net/http"
	"encoding/json"
	"errors"
	
	"github.com/form3tech-oss/jwt-go"
	"gorm.io/gorm"
	"github.com/gorilla/mux"

	"go-server/models"
	"go-server/schemas"
)



func GetCartHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value("user").(*jwt.Token).Claims.(jwt.MapClaims)
        if !ok {
            http.Error(w, "Не удалось получить данные пользователя", http.StatusBadRequest)
            return
        }
        userID := uint(claims["user_id"].(float64))
        

        var cart models.Cart
        err := db.Preload("CartItems.ProductCard").Where("user_id = ?", userID).First(&cart).Error
        

        if errors.Is(err, gorm.ErrRecordNotFound) {
            cart = models.Cart{UserID: userID}
            if err := db.Create(&cart).Error; err != nil {
                http.Error(w, "Ошибка при создании корзины", http.StatusInternalServerError)
                return
            }
        } else if err != nil {
            http.Error(w, "Ошибка при получении корзины", http.StatusInternalServerError)
            return
        }
        

        var total int
        var items []schemas.CartItemResponse
        
        for _, item := range cart.CartItems {
            subtotal := item.ProductCard.Price * item.Quantity
            total += subtotal
            
            items = append(items, schemas.CartItemResponse{
                ID:          item.ID,
                ProductCard: item.ProductCard,
                Quantity:    item.Quantity,
                Subtotal:    subtotal,
            })
        }
    

        response := schemas.CartResponse{
            ID:     cart.ID,
            UserID: cart.UserID,
            Items:  items,
            Total:  total,
        }
    
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    }
}


func AddToCartHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value("user").(*jwt.Token).Claims.(jwt.MapClaims)
        if !ok {
            http.Error(w, "Не удалось получить данные пользователя", http.StatusBadRequest)
            return
        }
        userID := uint(claims["user_id"].(float64))
        

        var req schemas.AddToCartRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
            return
        }
        

        var cart models.Cart
        if err := db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
            if errors.Is(err, gorm.ErrRecordNotFound) {
                cart = models.Cart{UserID: userID}
                if err := db.Create(&cart).Error; err != nil {
                    http.Error(w, "Ошибка при создании корзины", http.StatusInternalServerError)
                    return
                }
            } else {
                http.Error(w, "Ошибка при получении корзины", http.StatusInternalServerError)
                return
            }
        }
        

        var product models.ProductCard
        if err := db.First(&product, req.ProductCardID).Error; err != nil {
            http.Error(w, "Товар не найден", http.StatusNotFound)
            return
        }
        

        var cartItem models.CartItem
        result := db.Where("cart_id = ? AND product_card_id = ?", cart.ID, req.ProductCardID).First(&cartItem)
        
        if result.Error == nil {
            cartItem.Quantity += req.Quantity
            if err := db.Save(&cartItem).Error; err != nil {
                http.Error(w, "Ошибка при обновлении корзины", http.StatusInternalServerError)
                return
            }
        } else {
            cartItem = models.CartItem{
                CartID:        cart.ID,
                ProductCardID: req.ProductCardID,
                Quantity:      req.Quantity,
            }
            if err := db.Create(&cartItem).Error; err != nil {
                http.Error(w, "Ошибка при добавлении в корзину", http.StatusInternalServerError)
                return
            }
        }
        

        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(map[string]string{"message": "Товар добавлен в корзину"})
    }
}


func RemoveFromCartHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value("user").(*jwt.Token).Claims.(jwt.MapClaims)
        if !ok {
            http.Error(w, "Не удалось получить данные пользователя", http.StatusBadRequest)
            return
        }
        userID := uint(claims["user_id"].(float64))


        vars := mux.Vars(r)
        itemID := vars["id"]
        

        var cart models.Cart
        if err := db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
            http.Error(w, "Корзина не найдена", http.StatusNotFound)
            return
        }
        

        result := db.Where("cart_id = ? AND id = ?", cart.ID, itemID).Delete(&models.CartItem{})
        if result.Error != nil {
            http.Error(w, "Ошибка при удалении товара", http.StatusInternalServerError)
            return
        }
        
        if result.RowsAffected == 0 {
            http.Error(w, "Товар не найден в корзине", http.StatusNotFound)
            return
        }
        
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"message": "Товар удалён из корзины"})
    }
}

func UpdateCartItemHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value("user").(*jwt.Token).Claims.(jwt.MapClaims)
        if !ok {
            http.Error(w, "Не удалось получить данные пользователя", http.StatusBadRequest)
            return
        }
        userID := uint(claims["user_id"].(float64))


        vars := mux.Vars(r)
        itemID := vars["id"]
        

        var req schemas.UpdateCartItemRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Неверный формат запроса", http.StatusBadRequest)
            return
        }
        

        var cart models.Cart
        if err := db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
            http.Error(w, "Корзина не найдена", http.StatusNotFound)
            return
        }
        

        var item models.CartItem
        result := db.Model(&item).
            Where("id = ? AND cart_id = ?", itemID, cart.ID).
            Update("quantity", req.Quantity)
        
        if result.Error != nil {
            http.Error(w, "Ошибка при обновлении количества", http.StatusInternalServerError)
            return
        }
        
        if result.RowsAffected == 0 {
            http.Error(w, "Товар не найден в корзине", http.StatusNotFound)
            return
        }
        
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"message": "Количество обновлено"})
    }
}

func ClearCartHandler(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        claims, ok := r.Context().Value("user").(*jwt.Token).Claims.(jwt.MapClaims)
        if !ok {
            http.Error(w, "Не удалось получить данные пользователя", http.StatusBadRequest)
            return
        }
        userID := uint(claims["user_id"].(float64))
        

        var cart models.Cart
        if err := db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
            http.Error(w, "Корзина не найдена", http.StatusNotFound)
            return
        }
        

        result := db.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{})
        if result.Error != nil {
            http.Error(w, "Ошибка при очистке корзины", http.StatusInternalServerError)
            return
        }
        
        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"message": "Корзина очищена"})
    }
}