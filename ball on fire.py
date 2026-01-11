import pygame
import random

# --- 1. CONFIGURATION & SETUP ---
pygame.init()

# Screen Dimensions
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("MVP Basketball")

# Colors
WHITE = (255, 255, 255)
BLACK = (20, 20, 20)
ORANGE = (255, 140, 0)
RED = (255, 69, 0)
YELLOW = (255, 215, 0)
GREY = (200, 200, 200)

# Game Constants
GRAVITY = 0.5
BASKET_SPEED = 3
BALL_SPEED_X = 12
BALL_SPEED_Y = -15  # Negative because Y=0 is top
START_POS = (100, HEIGHT - 100)

# Fonts
font_score = pygame.font.SysFont("Arial", 30, bold=True)
font_streak = pygame.font.SysFont("Arial", 20)

# --- 2. GAME STATE VARIABLES ---
clock = pygame.time.Clock()

# Basket State
basket_w, basket_h = 80, 10
basket_x = WIDTH - 150
basket_y = HEIGHT // 2
basket_dir = 1  # 1 for down, -1 for up

# Ball State
# Ball State
ball_radius = 15
ball_x, ball_y = START_POS
ball_vx, ball_vy = 0, 0
launch_power_x = BALL_SPEED_X
launch_power_y = BALL_SPEED_Y
is_thrown = False

# Score State
score = 0
streak = 0
high_score = 0

def draw_fire_effect(surface, x, y):
    """Draws a simple fiery glow behind the ball."""
    # Outer glow (Red)
    pygame.draw.circle(surface, RED, (int(x), int(y)), ball_radius + 8)
    # Inner glow (Yellow)
    pygame.draw.circle(surface, YELLOW, (int(x), int(y)), ball_radius + 4)
    # Simple sparks
    for _ in range(3):
        spark_x = x + random.randint(-15, 0)
        spark_y = y + random.randint(-10, 10)
        pygame.draw.circle(surface, YELLOW, (int(spark_x), int(spark_y)), 3)

def reset_ball():
    """Resets ball to starting position."""
    global ball_x, ball_y, ball_vx, ball_vy, is_thrown
    ball_x, ball_y = START_POS
    ball_vx, ball_vy = 0, 0
    is_thrown = False

# --- 3. MAIN GAME LOOP ---
running = True
while running:
    # A. Event Handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        # Throw ball on Space Bar
    # Throw ball on Space Bar
    if event.type == pygame.KEYDOWN:
        if event.key == pygame.K_SPACE and not is_thrown:
            is_thrown = True
            ball_vx = launch_power_x
            ball_vy = launch_power_y
        
        # Adjust Trajectory Logic
        if not is_thrown:
            if event.key == pygame.K_UP:
                launch_power_y -= 1  # More upward force (more negative)
            if event.key == pygame.K_DOWN:
                launch_power_y += 1  # Less upward force
            if event.key == pygame.K_RIGHT:
                launch_power_x += 1  # More forward force
            if event.key == pygame.K_LEFT:
                launch_power_x -= 1  # Less forward force

    # B. Update Logic
    
    # 1. Move Basket (Toggle Up/Down)
    basket_y += BASKET_SPEED * basket_dir
    # Check bounds to toggle direction
    if basket_y > HEIGHT - 100 or basket_y < 100:
        basket_dir *= -1
    
    # 2. Move Ball (Physics)
    if is_thrown:
        ball_x += ball_vx
        ball_y += ball_vy
        ball_vy += GRAVITY  # Apply gravity
    
    # 3. Collision Detection (Scoring)
    # Create Rects for easy collision checking
    ball_rect = pygame.Rect(ball_x - ball_radius, ball_y - ball_radius, ball_radius*2, ball_radius*2)
    basket_rect = pygame.Rect(basket_x, basket_y, basket_w, basket_h)

    # Check if ball hit the basket
    if ball_rect.colliderect(basket_rect):
        # Only count if falling downwards to simulate "going through" the hoop
        if ball_vy > 0: 
            score += 1
            streak += 1
            reset_ball()
            
    # Check if ball hit the backboard
    backboard_rect = pygame.Rect(basket_x + basket_w - 5, basket_y - 40, 5, 50)
    if ball_rect.colliderect(backboard_rect):
        ball_vx *= -1
        # Push ball out slightly to prevent sticking
        if ball_vx < 0:
            ball_x = basket_x + basket_w - 5 - ball_radius - 1
        else:
            ball_x = basket_x + basket_w + ball_radius + 1
            
    # Check if ball went off screen (Miss)
    if ball_x > WIDTH or ball_y > HEIGHT:
        streak = 0  # Reset streak on miss
        reset_ball()

    # C. Drawing (UI & Visuals)
    screen.fill(WHITE)

    # Draw UI (Score & Streak)
    score_text = font_score.render(f"Score: {score}", True, BLACK)
    streak_text = font_streak.render(f"Streak: {streak}", True, YELLOW if streak >= 3 else GREY)
    
    screen.blit(score_text, (20, 20))
    screen.blit(streak_text, (20, 60))

    if streak >= 3:
        fire_msg = font_streak.render("ON FIRE!", True, RED)
        screen.blit(fire_msg, (20, 90))

    # Draw Basket
    # Backboard
    pygame.draw.rect(screen, BLACK, (basket_x + basket_w - 5, basket_y - 40, 5, 50))
    # Rim
    pygame.draw.rect(screen, RED, (basket_x, basket_y, basket_w, basket_h))
    
    # Draw Net
    net_color = (150, 150, 150)
    for i in range(0, basket_w, 12):
        # Diagonal /
        pygame.draw.line(screen, net_color, (basket_x + i, basket_y + basket_h), 
                         (basket_x + i + 8, basket_y + basket_h + 40), 2)
        # Diagonal \
        pygame.draw.line(screen, net_color, (basket_x + i + 12, basket_y + basket_h), 
                         (basket_x + i + 4, basket_y + basket_h + 40), 2)
    
    # Draw Trajectory Line (only if not thrown)
    if not is_thrown:
        traj_x, traj_y = START_POS
        traj_vx, traj_vy = launch_power_x, launch_power_y
        for _ in range(15):  # Simulate 15 steps
            traj_x += traj_vx
            traj_y += traj_vy
            traj_vy += GRAVITY
            pygame.draw.circle(screen, GREY, (int(traj_x), int(traj_y)), 2)
    
    # Draw Ball (with Fire logic)
    if streak >= 3 and is_thrown:
        draw_fire_effect(screen, ball_x, ball_y)
    
    pygame.draw.circle(screen, ORANGE, (int(ball_x), int(ball_y)), ball_radius)

    # D. Refresh Screen
    pygame.display.flip()
    clock.tick(60)

pygame.quit()