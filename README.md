![Example](/app-screenshot.png)

# About

Implementation of a line-search primal-dual interior-point optimization algorithm in Typescript.

The implementation is largely inspired by Nocedal and Wright (2000), Wächter and Biegler (2005) as well as the documentation of the open-source interior-point solver IPOPT.

Some selected details about the implementation:

- Gradients are supplied via forward-mode automatic differentiation.

- The Hessian of the Lagrangian function is approximated via a damped BFGS method.

- The algorithm allows skipping barrier problems if the barrier test is already met (this is equivalent to the mu_allow_fast_monotone_decrease option in IPOPT).

- I use a very basic line-search procedure without keeping track of a filter or switching to a feasibility restoration phase in case the step size becomes too small. I'll save these for future improvements.
