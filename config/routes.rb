Rails.application.routes.draw do
  resources :games, only: [:new, :create]

  root to: 'games#new'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
