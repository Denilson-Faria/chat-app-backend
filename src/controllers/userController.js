import User from "../models/User.js";

export async function searchUsers(req, res) {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  const users = await User.find({
    name: { $regex: name, $options: "i" },
  }).select("name avatar online");

  res.json(users);
}
