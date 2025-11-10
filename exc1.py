import numpy as np
import matplotlib.pyplot as plt

# Euler's Method for dx/dt = -λx
# Analytical solution: x(t) = x0 * exp(-λt)
# Euler's method: x̂(t + Δt) = x̂(t) * (1 - λΔt)
# After n steps: x̂(t1) = x0 * (1 - λΔt)^(t1/Δt)
#
# Three qualitative outcomes (multiplier m = 1 - λΔt):
# 1. |m| < 1  →  0 < Δt < 2/λ  (stable decay)
# 2. |m| = 1  →  Δt = 2/λ      (critical, oscillation)
# 3. |m| > 1  →  Δt > 2/λ      (unstable divergence)

lamda = 1
x0 = 1
t_end = 10

# Three cases: stable, critical, unstable
# For λ=1: critical Δt = 2/λ = 2
triangle_t_values = [0.5, 2.0, 3.0]

plt.figure(figsize=(12, 4))

for idx, triangle_t in enumerate(triangle_t_values):
    plt.subplot(1, 3, idx+1)

    t = np.arange(0, t_end, triangle_t)
    # Euler: x̂(n) = x0 * (1 - λΔt)^n
    x_hat = x0 * (1 - lamda*triangle_t)**(t/triangle_t)
    plt.plot(t, x_hat, 'o-', label=f'Euler Δt={triangle_t}')

    # Exact solution
    t_cont = np.linspace(0, t_end, 500)
    x_exact = x0 * np.exp(-lamda * t_cont)
    plt.plot(t_cont, x_exact, 'k--', linewidth=2, label='Exact')

    plt.legend()
    plt.xlabel('t')
    plt.ylabel('x(t)')
    plt.grid(True, alpha=0.3)

    # Classify based on Δt relative to 2/λ
    critical_dt = 2.0 / lamda
    if triangle_t < critical_dt:
        plt.title(f'Stable: Δt < 2/λ\nΔt={triangle_t}')
    elif triangle_t == critical_dt:
        plt.title(f'Critical: Δt = 2/λ\nΔt={triangle_t}')
    else:
        plt.title(f'Unstable: Δt > 2/λ\nΔt={triangle_t}')

plt.tight_layout()
plt.show()

# Question 2: Error behavior for λ=2, Δt=0.1, t1=20
lamda = 2
triangle_t = 0.1
t_end = 20
t = np.arange(0, t_end+triangle_t, triangle_t)

# Euler's method iteration
x_hat = np.zeros_like(t)
x_hat[0] = x0
for i in range(1, len(t)):
    x_hat[i] = x_hat[i-1] * (1 - lamda * triangle_t)

# Exact solution
x_exact = x0 * np.exp(-lamda * t)

# Error
epsilon = np.abs(x_exact - x_hat)

plt.figure()
plt.plot(t, epsilon)
plt.xlabel('t')
plt.ylabel('ε(t)')
plt.title(f'Error over time, λ={lamda}, Δt={triangle_t}')
plt.grid(True, alpha=0.3)
plt.show()
