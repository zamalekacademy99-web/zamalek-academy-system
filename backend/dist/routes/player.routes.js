"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const player_controller_1 = require("../controllers/player.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware"); // Removed authorize to allow standard Admins
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, player_controller_1.getAllPlayers); // Optional: add authorization layer
router.post('/register', auth_middleware_1.authenticate, player_controller_1.registerPlayer);
router.put('/:id', auth_middleware_1.authenticate, player_controller_1.updatePlayer);
router.delete('/:id', auth_middleware_1.authenticate, player_controller_1.deletePlayer);
exports.default = router;
