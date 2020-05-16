Rails.application.routes.draw do
  get 'games/new'

  root to: 'games#new'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
