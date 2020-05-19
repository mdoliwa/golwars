class Board < ApplicationRecord
  def data
    super.unpack("C*").each_slice(2).to_a
  end

  def data=(cells)
    super(cells.flatten.pack("C*"))
  end
end
