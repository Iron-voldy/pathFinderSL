const sequelize = require('../../config/database');
const BudgetPlan = require('../models/BudgetPlan');
const BudgetItem = require('../models/BudgetItem');
const User = require('../../user-management/models/User');

// Set up associations (idempotent)
BudgetPlan.hasMany(BudgetItem, { foreignKey: 'plan_id', as: 'items' });
BudgetItem.belongsTo(BudgetPlan, { foreignKey: 'plan_id', as: 'plan' });
BudgetPlan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const calcTotals = (plan) => {
  const p = plan.toJSON ? plan.toJSON() : { ...plan };
  const items = p.items || [];
  p.total_estimated = items.reduce((s, i) => s + parseFloat(i.estimated_cost || 0), 0);
  p.total_actual = items.reduce((s, i) => s + parseFloat(i.actual_cost || 0), 0);
  p.item_count = items.length;
  return p;
};

// ─── User: Plans ─────────────────────────────────────────────────────────────

const getMyPlans = async (req, res, next) => {
  try {
    const plans = await BudgetPlan.findAll({
      where: { user_id: req.user.id },
      include: [{ model: BudgetItem, as: 'items' }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: plans.map(calcTotals) });
  } catch (err) {
    next(err);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    const plan = await BudgetPlan.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        {
          model: BudgetItem,
          as: 'items',
          order: [['created_at', 'ASC']],
        },
      ],
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: calcTotals(plan) });
  } catch (err) {
    next(err);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const { plan_name, destination, start_date, end_date, total_budget, currency, notes, status, adult_count, child_count } =
      req.body;
    const plan = await BudgetPlan.create({
      user_id: req.user.id,
      plan_name,
      destination: destination || null,
      start_date: start_date || null,
      end_date: end_date || null,
      total_budget: parseFloat(total_budget) || 0,
      currency: currency || 'LKR',
      notes: notes || null,
      status: status || 'planning',
      adult_count: parseInt(adult_count) || 1,
      child_count: parseInt(child_count) || 0,
    });
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await BudgetPlan.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    const { plan_name, destination, start_date, end_date, total_budget, currency, notes, status, adult_count, child_count } =
      req.body;
    await plan.update({
      plan_name,
      destination: destination || null,
      start_date: start_date || null,
      end_date: end_date || null,
      total_budget: parseFloat(total_budget) || 0,
      currency: currency || 'LKR',
      notes: notes || null,
      status,
      adult_count: parseInt(adult_count) || 1,
      child_count: parseInt(child_count) || 0,
    });
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await BudgetPlan.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    await plan.destroy();
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── User: Items ──────────────────────────────────────────────────────────────

const addItem = async (req, res, next) => {
  try {
    const plan = await BudgetPlan.findOne({
      where: { id: req.params.planId, user_id: req.user.id },
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const { category, item_name, description, estimated_cost, actual_cost, item_date, notes } =
      req.body;
    const item = await BudgetItem.create({
      plan_id: plan.id,
      category: category || 'miscellaneous',
      item_name,
      description: description || null,
      estimated_cost: parseFloat(estimated_cost) || 0,
      actual_cost: actual_cost !== undefined && actual_cost !== '' ? parseFloat(actual_cost) : null,
      item_date: item_date || null,
      notes: notes || null,
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await BudgetItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const plan = await BudgetPlan.findOne({ where: { id: item.plan_id, user_id: req.user.id } });
    if (!plan) return res.status(403).json({ success: false, message: 'Access denied' });

    const { category, item_name, description, estimated_cost, actual_cost, item_date, notes } =
      req.body;
    await item.update({
      category: category || item.category,
      item_name: item_name || item.item_name,
      description: description !== undefined ? description : item.description,
      estimated_cost: estimated_cost !== undefined ? parseFloat(estimated_cost) : item.estimated_cost,
      actual_cost:
        actual_cost !== undefined && actual_cost !== '' ? parseFloat(actual_cost) : item.actual_cost,
      item_date: item_date !== undefined ? item_date || null : item.item_date,
      notes: notes !== undefined ? notes || null : item.notes,
    });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await BudgetItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const plan = await BudgetPlan.findOne({ where: { id: item.plan_id, user_id: req.user.id } });
    if (!plan) return res.status(403).json({ success: false, message: 'Access denied' });

    await item.destroy();
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

const adminGetAllPlans = async (req, res, next) => {
  try {
    const plans = await BudgetPlan.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
        { model: BudgetItem, as: 'items' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: plans.map(calcTotals) });
  } catch (err) {
    next(err);
  }
};

const adminGetStats = async (req, res, next) => {
  try {
    const totalPlans = await BudgetPlan.count();
    const planning = await BudgetPlan.count({ where: { status: 'planning' } });
    const active = await BudgetPlan.count({ where: { status: 'active' } });
    const completed = await BudgetPlan.count({ where: { status: 'completed' } });
    const totalItems = await BudgetItem.count();

    const budgetSum = await BudgetPlan.sum('total_budget');
    const spentSum = await BudgetItem.sum('actual_cost');

    res.json({
      success: true,
      data: {
        totalPlans,
        byStatus: { planning, active, completed },
        totalItems,
        totalBudgetValue: budgetSum || 0,
        totalSpent: spentSum || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  addItem,
  updateItem,
  deleteItem,
  adminGetAllPlans,
  adminGetStats,
};
