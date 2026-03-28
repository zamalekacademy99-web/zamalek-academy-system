"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branch_controller_1 = require("../controllers/branch.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Only authenticated users can see branches (Admin/Management/Parents)
router.get('/', auth_middleware_1.authenticate, branch_controller_1.getAllBranches);
// Only Super Admin can create branches
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), branch_controller_1.createBranch);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['SUPER_ADMIN', 'ADMIN']), branch_controller_1.updateBranch);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['SUPER_ADMIN']), branch_controller_1.deleteBranch);
exports.default = router;
