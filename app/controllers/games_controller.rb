class GamesController < ApplicationController
  def new
  end

  def create
    Board.create(data: params[:player_cells])
  end
end
