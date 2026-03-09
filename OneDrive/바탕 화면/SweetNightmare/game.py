import pygame
import sys
import random
import time
import math
from pygame.locals import * # K_LEFT, QUIT 등 상수를 바로 사용하기 위해 임포트

# 초기화 및 설정
pygame.init() # Pygame 모듈 초기화
pygame.font.init() # 폰트 모듈 초기화
pygame.mixer.init() # 사운드 믹서 모듈 초기화
random.seed(time.time()) # 현재 시간을 기반으로 난수 시드 설정

# 화면 설정
WIDTH, HEIGHT = 800, 600 # 화면 너비와 높이 정의
SCREEN_SIZE = (WIDTH, HEIGHT) # 화면 크기 튜플
screen = pygame.display.set_mode(SCREEN_SIZE) # 지정된 크기로 화면 생성
pygame.display.set_caption("Sweet Nightmare Boss Fight") # 윈도우 타이틀 설정

# 게임 속도
FPS = 60 # 초당 프레임 수
clock = pygame.time.Clock() # 시간 및 프레임 속도 관리를 위한 Clock 객체 생성

# 상수
ASSET_PATH = "assets/" # 이미지, 사운드 파일 경로 접두사
TITLE_BGM_FILE = ASSET_PATH + "title_bgm.mp3" # 타이틀 BGM 파일 경로
READY_BGM_FILE = ASSET_PATH + "ready_bgm.mp3" # 준비/플랫폼 이동 BGM 파일 경로
BOSS_BGM_FILE = ASSET_PATH + "boss_bgm.mp3" # 보스전 BGM 파일 경로

# 플랫폼 데이터 (x, y, width, height)
PLATFORM_DATA_READY = [
    (0, 540, 800, 60), # 바닥 (준비 상태)
    (730, 370, 70, 200), # 오른쪽 높은 플랫폼
    (660, 450, 140, 100), # 오른쪽 낮은 플랫폼
    (0, 370, 120, 230), # 왼쪽 플랫폼
]
PLATFORM_DATA_BOSS = [
    (0, 540, 800, 60), # 바닥 (보스 상태)
    (660, 410, 170, 100), # 오른쪽 보스 영역 플랫폼
    (0, 390, 170, 220), # 왼쪽 플레이어 시작/요정 영역 플랫폼
]


def create_platforms(data):
    # 플랫폼 데이터 리스트를 Pygame Rect 객체 리스트로 변환
    return [pygame.Rect(x, y, w, h) for x, y, w, h in data]


active_platforms = create_platforms(PLATFORM_DATA_READY) # 초기 활성화 플랫폼 설정 (준비 상태)
GROUND_Y_BASE = 540 # 기본 바닥의 Y 좌표

# 색상 (RGB 정의)
WHITE = (255, 255, 255)
RED = (255, 50, 50)
GREEN = (50, 255, 50)
BLACK = (0, 0, 0)

# 게임 상태 상수
TITLE = 0 # 타이틀 화면
READY = 1 # 보스전 진입 전 준비/이동 구간
PLAYING = 2 # 보스 전투 중
GAME_OVER = 3 # 게임 오버 또는 클리어 화면
FADE_TO_READY = 4 # 타이틀에서 READY 화면으로 넘어가는 페이드/나레이션 중

# 전역 변수 초기화
game_state = TITLE # 초기 게임 상태
slow_motion = 0 # 슬로우 모션 지속 시간 (ms)
fade_start_time = 0 # 페이드 시작 시간
fade_duration = 1500 # 페이드 인/아웃 지속 시간 (각각 750ms)
game_clear_time = 0 # 게임 클리어 시간 기록

# 서사 관련 변수
NARRATIVE_DISPLAY_TIME = 2000 # 🌟 나레이션 표시 시간 (2초)
narrative_display_start = 0 # 나레이션 표시 시작 시간

# 카메라 흔들림 변수
camera_shake_duration = 0 # 카메라 흔들림 남은 시간
camera_shake_intensity = 0 # 카메라 흔들림 강도

# 폰트
font_path = pygame.font.match_font('malgungothic') # 시스템에서 '맑은 고딕' 폰트 경로 찾기
if font_path: # 폰트 경로가 있다면 해당 폰트로 설정
    FONT = pygame.font.Font(font_path, 24)
    SMALL_FONT = pygame.font.Font(font_path, 18)
    BIG_FONT = pygame.font.Font(font_path, 48)
    NARRATIVE_FONT = pygame.font.Font(font_path, 36)
else: # 폰트 경로가 없다면 기본 시스템 폰트로 설정
    FONT = pygame.font.SysFont(None, 24)
    SMALL_FONT = pygame.font.SysFont(None, 18)
    BIG_FONT = pygame.font.SysFont(None, 48)
    NARRATIVE_FONT = pygame.font.SysFont(None, 36)


# 유틸리티 함수
def load_img(filename, size=None, colorkey=None):
    # 이미지 파일을 로드하고 필요한 경우 크기를 조정하는 함수
    full_path = ASSET_PATH + filename
    try:
        if size is None:
            size = (WIDTH, HEIGHT)
        img = pygame.image.load(full_path).convert_alpha() # 이미지 로드 및 알파 채널 유지
    except pygame.error as e:
        # 이미지 로드 실패 시 오류 메시지 출력 및 임시 빨간색 표면 반환
        print(f"❌ **치명적 이미지 로드 실패:** '{full_path}'", file=sys.stderr)
        sys.stderr.flush()
        img = pygame.Surface(size or (50, 50), SRCALPHA)
        img.fill(RED)
        return img

    if size and img.get_size() != size:
        img = pygame.transform.scale(img, size) # 이미지 크기 조정
    if colorkey:
        img.set_colorkey(colorkey) # 특정 색상을 투명하게 설정
    return img


def draw_text(text, x, y, color=WHITE, font=FONT, center=False):
    # 화면에 텍스트를 그리는 함수
    text_surface = font.render(text, True, color) # 폰트로 텍스트 표면 생성
    text_rect = text_surface.get_rect() # 텍스트 표면의 Rect 가져오기
    if center:
        text_rect.center = (x, y) # 중앙 정렬
    else:
        text_rect.topleft = (x, y) # 좌측 상단 정렬
    screen.blit(text_surface, text_rect) # 화면에 텍스트 표면 그리기


def draw_bar(x, y, w, h, current_value, max_value, color, smooth_value):
    # 체력 바를 그리는 함수 (부드러운 감소 효과 포함)
    ratio = current_value / max_value # 현재 체력 비율
    smooth_ratio = smooth_value / max_value # 부드러운 체력 비율

    # 전체 바 배경
    pygame.draw.rect(screen, (50, 50, 50), (x, y, w, h))
    # 부드럽게 감소하는 부분 (현재 체력과 부드러운 체력 사이의 간격)
    gap_x = x + int(w * ratio)
    pygame.draw.rect(screen, (80, 80, 80), (gap_x, y, int(w * smooth_ratio) - gap_x, h))
    # 현재 HP
    pygame.draw.rect(screen, color, (x, y, int(w * ratio), h))
    # 테두리
    pygame.draw.rect(screen, BLACK, (x, y, w, h), 2)

    # smooth_value 업데이트 (체력이 천천히 따라가게 함)
    if smooth_value > current_value:
        return max(current_value, smooth_value - max_value / 500) # 초당 max_value/500 속도로 감소
    return current_value


def play_bgm(filename):
    # 배경 음악을 로드하고 무한 반복 재생
    try:
        pygame.mixer.music.load(filename)
        pygame.mixer.music.play(-1) # -1은 무한 반복
    except pygame.error as e:
        print(f"BGM 로드/재생 실패: {filename}, 오류: {e}", file=sys.stderr)


def start_camera_shake(intensity, duration_ms):
    # 카메라 흔들림 효과 시작
    global camera_shake_duration, camera_shake_intensity
    camera_shake_intensity = intensity
    camera_shake_duration = duration_ms


def update_camera_shake(dt):
    # 카메라 흔들림 효과 업데이트 및 오프셋 계산
    global camera_shake_duration, camera_shake_intensity
    offset_x, offset_y = 0, 0

    if camera_shake_duration > 0:
        camera_shake_duration = max(0, camera_shake_duration - dt) # 남은 시간 감소
        # 시간이 지남에 따라 강도도 점차 감소
        current_intensity = camera_shake_intensity * (camera_shake_duration / 200.0)

        # 무작위 오프셋 계산
        offset_x = random.uniform(-current_intensity, current_intensity)
        offset_y = random.uniform(-current_intensity, current_intensity)

    return offset_x, offset_y # 화면을 그릴 때 적용할 오프셋 반환


# ------------------- 3. 클래스 정의 -------------------

class Entity:
    # 게임 내 모든 움직이거나 상호작용하는 객체의 기본 클래스
    def __init__(self, x, y, width, height, image_name):
        self.width, self.height = width, height
        self.original_image = load_img(image_name, (width, height)) # 원본 이미지 로드
        self.image = self.original_image.copy() # 화면에 그려질 현재 이미지 (수정 가능)
        self.rect = self.image.get_rect(topleft=(x, y)) # 위치와 크기를 정의하는 Rect 객체
        self.health = 100
        self.max_health = 100
        self.alive = True
        self.death_time = 0

    def take_damage(self, damage):
        # 피해를 입는 메서드
        if not self.alive: return
        self.health = max(0, self.health - damage)
        if self.health == 0:
            self.die()

    def die(self):
        # 사망 처리
        self.alive = False
        self.death_time = pygame.time.get_ticks()


class Player(Entity):
    # 플레이어 클래스
    def __init__(self, x, y):
        super().__init__(x, y, 60, 60, "player.png") # Entity 초기화
        self.max_health = 1
        self.health = self.max_health
        self.vel_y = 0 # Y축 속도 (중력/점프)
        self.is_jumping = False # 점프 중인지 여부
        self.gravity = 1 # 중력 가속도
        self.move_speed = 5 # 이동 속도
        self.invulnerable_until = 0 # 무적 시간 종료 시점
        self.attack_cooldown = 0 # 공격 쿨다운 종료 시점
        self.attack_duration = 100 # 공격 애니메이션 지속 시간
        self.last_attack_time = 0 # 마지막 공격 시간
        self.attack_hitbox = pygame.Rect(0, 0, 0, 0) # 공격 판정 영역
        self.is_hit = False # 피격 상태 여부

        self.is_attacking = False # 공격 중 여부
        self.facing_right = True # 오른쪽을 보고 있는지 여부
        self.animation_frames = {} # 애니메이션 프레임 딕셔너리
        self.current_frame = 0
        self.last_frame_update = 0
        self.frame_duration = 100

        self._load_animations() # 애니메이션 이미지 로드

    def _load_animations(self):
        # 플레이어의 애니메이션 이미지를 로드하고 저장
        size = (self.width, self.height)

        idle_r = load_img("player.png", size)
        idle_l = pygame.transform.flip(idle_r, True, False) # 좌우 반전
        self.animation_frames['idle'] = [idle_r, idle_l] # [오른쪽, 왼쪽]

        run_r_frame = load_img("pRight.png", size)
        run_l_frame = load_img("pLeft.png", size)
        self.animation_frames['run'] = [run_r_frame, run_l_frame]

        self.animation_frames['jump'] = [run_r_frame, run_l_frame] # 점프는 달리기와 같은 프레임 사용

        attack_r_frame = load_img("pRhit.png", size)
        attack_l_frame = load_img("pLhit.png", size)
        self.animation_frames['attack'] = [attack_r_frame, attack_l_frame]
        self.animation_frames['hit'] = [attack_r_frame, attack_l_frame] # 피격은 공격과 같은 프레임 사용

    def _handle_collision(self, dx, dy):
        # 플랫폼과의 충돌 처리
        global active_platforms

        # X축 충돌 처리
        self.rect.x += dx
        for p in active_platforms:
            is_in_y_range = p.bottom > self.rect.top and p.top < self.rect.bottom - 5 # 캐릭터 발 아래쪽으로 충돌만 체크
            if is_in_y_range and self.rect.colliderect(p):
                if dx > 0:
                    self.rect.right = p.left # 오른쪽으로 이동 시 플랫폼 왼쪽에 멈춤
                elif dx < 0:
                    self.rect.left = p.right # 왼쪽으로 이동 시 플랫폼 오른쪽에 멈춤

        # Y축 충돌 처리
        self.rect.y += dy
        landed_platform = None
        for p in active_platforms:
            is_in_x_range = p.left < self.rect.right - 5 and p.right > self.rect.left + 5
            is_colliding_y = self.rect.bottom >= p.top and self.rect.top < p.top # 캐릭터 발이 플랫폼 위에 닿았는지

            if is_in_x_range and is_colliding_y and self.vel_y >= 0: # 아래로 떨어지는 중일 때만
                if landed_platform is None or p.top < landed_platform.top: # 가장 높은 플랫폼을 착지 지점으로 설정
                    landed_platform = p

        if landed_platform:
            self.rect.bottom = landed_platform.top # 플랫폼 위에 착지
            self.is_jumping = False
            self.vel_y = 0
        else:
            self.is_jumping = True # 땅에 닿지 않았으면 점프/낙하 중

        # 화면 경계 클램프 (READY 상태가 아닐 때만 맵 끝에서 끝으로 이동)
        if game_state != READY:
            self.rect.clamp_ip(screen.get_rect())
            if self.rect.right < 0:
                self.rect.left = WIDTH # 왼쪽으로 나갔으면 오른쪽 끝에서 등장
            elif self.rect.left > WIDTH:
                self.rect.right = 0 # 오른쪽으로 나갔으면 왼쪽 끝에서 등장
        if self.rect.bottom > HEIGHT:
            self.rect.bottom = HEIGHT # 화면 아래로 떨어지지 않도록 방지
            self.vel_y = 0
            self.is_jumping = False

    def move(self, keys):
        # 키 입력에 따른 움직임 및 점프 처리
        dx = 0

        if keys[K_LEFT] or keys[K_a]:
            dx -= self.move_speed
            self.facing_right = False
        if keys[K_RIGHT] or keys[K_d]:
            dx += self.move_speed
            self.facing_right = True

        if self.is_jumping: self.vel_y += self.gravity # 점프 중이면 중력 적용
        if self.vel_y > 15: self.vel_y = 15 # 최대 낙하 속도 제한
        dy = self.vel_y

        # 점프 로직
        if (keys[K_SPACE] or keys[K_w] or keys[K_UP]):
            if not self.is_jumping: # 땅에 닿아 있을 때만 점프 가능
                self.vel_y = -18 # 위쪽 속도 설정
                self.is_jumping = True

        self._handle_collision(dx, dy) # 계산된 이동량으로 충돌 처리 및 위치 업데이트
        return dx # 이동량 반환 (애니메이션에 사용)

    def take_damage(self, damage):
        # 플레이어가 피해를 입을 때 호출
        global slow_motion
        if pygame.time.get_ticks() > self.invulnerable_until: # 무적 시간이 아니면
            super().take_damage(damage)
            if self.alive:
                self.invulnerable_until = pygame.time.get_ticks() + 1000 # 1초 무적 시간 설정
                self.is_hit = True

                slow_motion = 100 # 짧은 슬로우 모션
                start_camera_shake(5, 200) # 카메라 흔들림

    def attack(self):
        # 공격 실행
        current_time = pygame.time.get_ticks()
        if current_time > self.attack_cooldown:
            self.attack_cooldown = current_time + 500 # 쿨다운 0.5초
            self.last_attack_time = current_time
            self.is_attacking = True
            # 공격 방향에 따라 공격 판정 영역 설정
            if self.facing_right:
                attack_x = self.rect.right
            else:
                attack_x = self.rect.left - 30
            self.attack_hitbox = pygame.Rect(attack_x, self.rect.centery - 15, 30, 30)
            return self.attack_hitbox
        return None

    def _get_current_image(self, dx):
        # 현재 상태에 맞는 애니메이션 프레임 반환
        direction_index = 0 if self.facing_right else 1

        if self.is_hit:
            return self.animation_frames['hit'][direction_index]

        if self.is_attacking:
            return self.animation_frames['attack'][direction_index]

        if self.is_jumping:
            return self.animation_frames['jump'][direction_index]

        if dx != 0:
            return self.animation_frames['run'][direction_index]

        return self.animation_frames['idle'][direction_index]

    def update(self, dx):
        # 플레이어 상태 업데이트 (애니메이션, 무적 시간, 공격 상태 등)
        current_time = pygame.time.get_ticks()

        if self.is_hit and current_time > self.invulnerable_until - 700:
            self.is_hit = False # 피격 애니메이션 종료

        if self.is_attacking and current_time > self.last_attack_time + self.attack_duration:
            self.is_attacking = False # 공격 상태 종료
            self.attack_hitbox = pygame.Rect(0, 0, 0, 0) # 공격 판정 초기화

        self.image = self._get_current_image(dx) # 현재 이미지 설정

        # 무적 시간 중 깜빡임 효과
        if current_time < self.invulnerable_until and self.alive:
            alpha = 100 if current_time // 100 % 2 == 0 else 255
            self.image.set_alpha(alpha)
        else:
            self.image.set_alpha(255)


class Boss(Entity):
    # 보스 클래스
    def __init__(self, x, y):
        super().__init__(x, y, 120, 120, "boss.png")
        self.max_health = 500
        self.health = self.max_health
        self.phase = 1 # 현재 보스 페이즈
        self.attack_cooldown = pygame.time.get_ticks() + 2000 # 초기 공격 쿨다운
        self.projectiles = [] # 투사체 리스트
        self.explosion_particles = [] # 폭발 파티클 리스트
        self.vel_y = 0
        self.gravity = 1
        self.is_jumping = True
        self.explosion_started = False # 폭발 시작 여부
        self.hit_flash_until = 0 # 피격 시 흰색 깜빡임 종료 시간

        # 페이즈별 속성 정의
        self.PHASE_SPECS = {
            1: {'speed': 2, 'color': (255, 255, 255), 'proj_color': (255, 180, 60)}, # 흰색/노랑
            2: {'speed': 4, 'color': (255, 170, 170), 'proj_color': (255, 100, 100)}, # 연분홍/주황
            3: {'speed': 6, 'color': (255, 100, 100), 'proj_color': (255, 30, 30)} # 진분홍/빨강
        }

        self.apply_phase_attributes(self.phase) # 초기 페이즈 속성 적용

        self.boss_paused_until = 0 # 페이즈 변경 시 멈춤 시간
        self.phase_change_time = 0 # 마지막 페이즈 변경 시간
        # 보스 이미지에 현재 페이즈 색상 블렌딩 (초기 색상)
        self.image.fill(self.current_color, special_flags=pygame.BLEND_MULT)

    def apply_phase_attributes(self, phase):
        # 지정된 페이즈의 속성을 보스에 적용
        spec = self.PHASE_SPECS.get(phase, self.PHASE_SPECS[1])

        self.move_speed = spec['speed']
        self.current_color = spec['color']
        self.current_proj_color = spec['proj_color']

    def take_damage(self, damage):
        # 보스가 피해를 입을 때 호출
        if not self.alive: return
        super().take_damage(damage)

        self.hit_flash_until = pygame.time.get_ticks() + 100 # 짧은 흰색 깜빡임 효과

    def _handle_movement(self, target_player):
        # 플레이어를 따라 이동하고 플랫폼 충돌 처리
        global active_platforms

        dx = 0
        if target_player.alive:
            if self.rect.centerx < target_player.rect.centerx - 20:
                dx = self.move_speed # 오른쪽 이동
            elif self.rect.centerx > target_player.rect.centerx + 20:
                dx = -self.move_speed # 왼쪽 이동

        # 중력 적용
        if self.is_jumping: self.vel_y += self.gravity
        if self.vel_y > 15: self.vel_y = 15
        dy = self.vel_y

        # X축 충돌 처리 (플레이어와 유사)
        self.rect.x += dx
        for p in active_platforms:
            is_in_y_range = p.bottom > self.rect.top and p.top < self.rect.bottom - 5
            if is_in_y_range and self.rect.colliderect(p):
                if dx > 0:
                    self.rect.right = p.left
                elif dx < 0:
                    self.rect.left = p.right

        # Y축 충돌 처리 (플레이어와 유사)
        self.rect.y += dy
        landed_platform = None
        for p in active_platforms:
            is_in_x_range = p.left < self.rect.right - 5 and p.right > self.rect.left + 5
            is_colliding_y = self.rect.bottom >= p.top and self.rect.top < p.top

            if is_in_x_range and is_colliding_y and self.vel_y >= 0:
                if landed_platform is None or p.top < landed_platform.top:
                    landed_platform = p

        if landed_platform:
            self.rect.bottom = landed_platform.top
            self.is_jumping = False
            self.vel_y = 0
        else:
            self.is_jumping = True

        # 화면 경계 클램프
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH

        if self.rect.bottom > 540:
            self.rect.bottom = 540

    def update(self):
        # 보스 상태 업데이트 (페이즈, 움직임, 공격, 폭발 등)
        global game_state, game_clear_time
        current_time = pygame.time.get_ticks()

        # 보스 이미지 색상 변화 (피격/페이즈 변경 깜빡임)
        base_color = self.PHASE_SPECS.get(self.phase, self.PHASE_SPECS[1])['color']

        if current_time < self.hit_flash_until:
            self.image.fill((255, 255, 255), special_flags=pygame.BLEND_MULT) # 피격 시 흰색
        elif current_time < self.phase_change_time + 500:
            self.image.fill((255, 30, 30), special_flags=pygame.BLEND_MULT) # 페이즈 변경 시 빨간색
        else:
            self.image.fill(base_color, special_flags=pygame.BLEND_MULT) # 기본 페이즈 색상

        if self.alive and game_state == PLAYING:

            # 페이즈 변경 로직 (체력 기반)
            new_phase = self.phase
            if self.health <= self.max_health * 0.4 and self.phase == 2:
                new_phase = 3
            elif self.health <= self.max_health * 0.7 and self.phase == 1:
                new_phase = 2

            if new_phase != self.phase:
                self.phase = new_phase
                self.apply_phase_attributes(new_phase)

                self.boss_paused_until = current_time + 2000 # 2초간 멈춤
                self.phase_change_time = current_time
                start_camera_shake(10, 500) # 큰 카메라 흔들림

            # 보스가 멈춰있지 않을 때만 움직임/공격 실행
            if current_time > self.boss_paused_until:
                if current_time > self.attack_cooldown:
                    self.attack()
                    # 다음 공격 쿨다운 설정 (페이즈에 따라 공격 주기가 달라지진 않음, 랜덤)
                    self.attack_cooldown = current_time + random.randint(1000, 2500)

                self._handle_movement(player) # 플레이어 따라 이동

        elif not self.alive:
            # 보스 사망 시 폭발 처리
            if not self.explosion_started:
                self.start_explosion() # 폭발 파티클 생성
                self.explosion_started = True

            self.update_explosion() # 파티클 이동 및 소멸 업데이트

            if self.explosion_started and not self.explosion_particles:
                game_state = GAME_OVER # 폭발이 끝나면 게임 오버 상태로 전환
                pygame.mixer.music.stop()
                if game_clear_time == 0:
                    game_clear_time = pygame.time.get_ticks() # 클리어 시간 기록

        # 투사체 업데이트
        for p in self.projectiles[:]:
            p['rect'].x += p['vel_x']
            p['rect'].y += p['vel_y']
            # 화면 밖으로 나가면 투사체 제거
            if p['rect'].top > HEIGHT or p['rect'].right < 0 or p['rect'].left > WIDTH:
                if p in self.projectiles:
                    self.projectiles.remove(p)

    def attack(self):
        # 보스 공격: 투사체 발사
        num_projectiles = self.phase # 페이즈에 따라 투사체 수 증가
        for _ in range(num_projectiles):
            speed = 5
            # 무작위 방향으로 속도 설정
            vel_x = speed * random.uniform(-1.5, 1.5)
            vel_y = speed * random.uniform(-1.5, 1.5)
            proj = {
                'rect': pygame.Rect(self.rect.centerx, self.rect.centery, 15, 15),
                'vel_x': vel_x,
                'vel_y': vel_y,
                'dmg': 10,
                'color': self.current_proj_color # 현재 페이즈의 투사체 색상
            }
            self.projectiles.append(proj)

    def start_explosion(self):
        # 폭발 파티클 생성
        if not self.explosion_particles:
            for _ in range(100):
                self.explosion_particles.append({
                    'x': self.rect.centerx + random.randint(-self.width // 2, self.width // 2),
                    'y': self.rect.centery + random.randint(-self.height // 2, self.height // 2),
                    'vel_x': random.uniform(-5, 5), # 초기 무작위 속도
                    'vel_y': random.uniform(-5, 5),
                    'color': (255, random.randint(0, 100), 0), # 붉은 계열 색상
                    'size': random.randint(3, 8),
                    'lifetime': random.randint(30, 100)
                })

    def update_explosion(self):
        # 폭발 파티클 업데이트
        for p in self.explosion_particles[:]:
            p['x'] += p['vel_x']
            p['y'] += p['vel_y']
            p['vel_y'] += 0.5 # 파티클에도 중력 적용
            p['lifetime'] -= 1
            p['size'] = max(1, p['size'] - 0.05) # 크기 감소
            if p['lifetime'] <= 0:
                self.explosion_particles.remove(p) # 수명 다한 파티클 제거


class Fairy(Entity):
    # 회복을 돕는 요정 클래스
    def __init__(self, x, y):
        super().__init__(x, y, 40, 40, "fairy.png")
        self.max_health = 1
        self.health = 1 # 체력은 의미 없음
        self.hover_offset = random.randint(0, 50) # 떠다니는 애니메이션 오프셋

    def update(self):
        # 요정 위치 업데이트 (공중 부양 효과)
        current_time = pygame.time.get_ticks()
        y_offset = int(5 * math.sin((current_time + self.hover_offset) / 300)) # 사인파를 이용한 상하 움직임
        if game_state == PLAYING:
            self.rect.y = 390 - self.height + y_offset # 보스전 위치
        else:
            self.rect.y = GROUND_Y_BASE - 50 + y_offset # 준비 상태 위치

    def interact(self, player):
        # 플레이어와 상호작용 (회복)
        heal_amount = player.max_health * 0.3 # 최대 체력의 30% 회복
        player.health = min(player.max_health, player.health + heal_amount) # 최대 체력까지만 회복


# ------------------- 4. 설정 및 이미지 로드 -------------------
try:
    # 배경 이미지 로드
    title_img = load_img("시작화면.png")
    background_ready = load_img("게임 스타트 시.png")
    background_playing = load_img("보스 등장 후.png")
    fade_img = load_img("방 이동 시 화면.png")

except Exception as e:
    # 이미지 로드 실패 시 종료
    sys.exit()

# 게임 객체
player = None
boss = None
fairy = None
smooth_player_hp = 0 # 체력 바 부드러운 감소용 변수


def reset_game():
    # 게임 상태를 초기화하고 READY 상태 직전으로 되돌림
    global player, boss, fairy, smooth_player_hp, slow_motion, active_platforms, game_state, game_clear_time, camera_shake_duration, narrative_display_start

    if player is None:
        player = Player(0, 0) # 플레이어 객체가 없으면 생성

    # 플레이어 상태 초기화
    player.rect.x = WIDTH // 2 - player.width // 2
    player.rect.bottom = GROUND_Y_BASE
    player.is_jumping = False
    player.vel_y = 0
    player.health = player.max_health
    player.alive = True
    player.is_attacking = False
    player.facing_right = True
    player.is_hit = False

    # 보스와 요정은 초기 맵 밖 위치에 배치
    boss = Boss(WIDTH * 2, GROUND_Y_BASE - 120)
    fairy = Fairy(WIDTH * 2, GROUND_Y_BASE - 80)

    # 전역 상태 변수 초기화
    smooth_player_hp = player.max_health
    slow_motion = 0
    game_clear_time = 0
    camera_shake_duration = 0
    narrative_display_start = 0

    active_platforms = create_platforms(PLATFORM_DATA_READY) # 준비 상태 플랫폼 설정


def enter_boss_scene():
    # 보스전 맵으로 전환
    global player, boss, fairy, game_state, active_platforms

    game_state = PLAYING # 상태 변경
    play_bgm(BOSS_BGM_FILE) # BGM 변경
    active_platforms = create_platforms(PLATFORM_DATA_BOSS) # 보스전 플랫폼으로 변경

    # 플레이어 위치 재설정
    player.rect.x = 0
    player.rect.bottom = 390
    player.is_jumping = False
    player.vel_y = 0

    # 보스와 요정 위치 재설정 (보스전 시작 위치)
    boss = Boss(WIDTH - 150, 410 - 120)
    fairy = Fairy(50, 390 - 40)


# ------------------- 5. 메인 루프 -------------------
player = Player(0, 0) # 최초 플레이어 객체 생성
play_bgm(TITLE_BGM_FILE) # 타이틀 BGM 시작

while True:
    # 1. 시간 및 속도 관리
    dt = clock.tick(FPS) # 프레임 속도(FPS)를 맞추고 마지막 프레임 이후 경과 시간(dt)을 가져옴

    if slow_motion > 0: slow_motion -= dt # 슬로우 모션 시간 감소
    if slow_motion <= 0: slow_motion = 0 # 슬로우 모션 시간 0 미만 방지

    keys = pygame.key.get_pressed() # 현재 눌린 키 상태 가져오기
    dx = 0

    cam_offset_x, cam_offset_y = update_camera_shake(dt) # 카메라 흔들림 오프셋 업데이트

    # 2. 이벤트 처리
    for e in pygame.event.get():
        if e.type == QUIT: # 윈도우 닫기 버튼
            pygame.mixer.music.stop()
            pygame.quit()
            sys.exit()

        if e.type == KEYDOWN:
            if game_state == TITLE:
                if e.key == K_SPACE: # 스페이스 키로 게임 시작
                    game_state = FADE_TO_READY # 페이드 상태로 전환
                    fade_start_time = pygame.time.get_ticks()
                    active_platforms = create_platforms(PLATFORM_DATA_READY)
                    reset_game()
                    game_clear_time = 0
                    pygame.mixer.music.stop() # 타이틀 BGM 정지

            elif game_state == GAME_OVER:
                if not player.alive and e.key == K_r: # 플레이어 사망 시 R 키로 재시작
                    reset_game()
                    game_state = READY
                    play_bgm(READY_BGM_FILE)

            elif game_state == PLAYING and player.alive and slow_motion <= 0:
                if e.key == K_LCTRL: # Ctrl 키로 공격
                    hit_rect = player.attack()
                    if hit_rect and boss.alive and hit_rect.colliderect(boss.rect): # 보스에게 공격이 닿았는지 체크
                        boss.take_damage(20) # 데미지 적용

                        slow_motion = 100 # 피격 슬로우 모션
                        start_camera_shake(3, 150) # 작은 카메라 흔들림

                        if not boss.alive: slow_motion = 2000 # 보스 사망 시 긴 슬로우 모션

                if e.key == K_e and player.rect.colliderect(fairy.rect): # E 키로 요정 상호작용 (회복)
                    fairy.interact(player)

    # 3. 업데이트
    current_time = pygame.time.get_ticks()

    if game_state == FADE_TO_READY:
        # 페이드 및 나레이션 로직
        elapsed = current_time - fade_start_time
        mid_point = fade_duration / 2
        total_fade_duration = fade_duration + NARRATIVE_DISPLAY_TIME

        if elapsed > mid_point and narrative_display_start == 0:
            narrative_display_start = current_time
            pygame.mixer.music.stop() # 페이드 아웃 중간에 BGM 정지

        if elapsed > total_fade_duration:
            game_state = READY # 페이드 인 완료 후 READY 상태로 전환
            narrative_display_start = 0
            if not pygame.mixer.music.get_busy():
                play_bgm(READY_BGM_FILE) # READY BGM 시작

    elif game_state == READY:
        if player.alive:
            dx = player.move(keys) # 플레이어 움직임
            player.update(dx) # 플레이어 상태 업데이트
            if player.rect.left > WIDTH: enter_boss_scene() # 화면 오른쪽 끝으로 나가면 보스전 진입

    elif game_state == PLAYING:
        if player.alive and slow_motion <= 0:
            dx = player.move(keys) # 플레이어 움직임 (슬로우 모션 중에는 멈춤)
        else:
            dx = 0

        player.update(dx)

        # 보스는 슬로우 모션 상태에도 업데이트는 진행 (애니메이션, 폭발 등)
        boss.update()

        fairy.update()

        if not player.alive:
            game_state = GAME_OVER # 플레이어 사망 시 게임 오버
            pygame.mixer.music.stop()

        if boss.alive:
            # 보스 투사체와 플레이어 충돌 처리
            for p in boss.projectiles[:]:
                if p['rect'].colliderect(player.rect) and player.alive:
                    player.take_damage(p['dmg'])
                    if p in boss.projectiles:
                        boss.projectiles.remove(p) # 충돌한 투사체 제거


    elif game_state == GAME_OVER:
        # 게임 클리어 후 일정 시간 뒤 자동 종료
        if player.alive and game_clear_time != 0:
            if current_time - game_clear_time > 10000:
                pygame.quit()
                sys.exit()

    # 4. 화면 그리기 (카메라 흔들림 적용)
    screen.fill(BLACK)

    if game_state == TITLE:
        screen.blit(title_img, (cam_offset_x, cam_offset_y)) # 타이틀 화면 이미지
        draw_text("Press SPACE to Start", WIDTH // 2 - 140 + cam_offset_x, HEIGHT // 2 + 150 + cam_offset_y, WHITE,
                  FONT)

    elif game_state == FADE_TO_READY:
        # 페이드 인/아웃 및 나레이션 화면 그리기
        elapsed = current_time - fade_start_time
        mid_point = fade_duration / 2

        # 1단계: 페이드 아웃 (타이틀 -> 검은 화면)
        if elapsed <= mid_point:
            screen.blit(title_img, (cam_offset_x, cam_offset_y))
            alpha = int(255 * (elapsed / mid_point)) # 투명도 증가
            fade_surface = fade_img.copy()
            fade_surface.set_alpha(min(255, max(0, alpha)))
            screen.blit(fade_surface, (0, 0))

        # 2단계: 검은 화면 + 나레이션 노출
        elif elapsed <= mid_point + NARRATIVE_DISPLAY_TIME:
            screen.fill(BLACK)
            # 나레이션 텍스트 깜빡임 효과를 위한 투명도 계산
            narrative_elapsed = current_time - (fade_start_time + mid_point)
            text_alpha_progress = narrative_elapsed / NARRATIVE_DISPLAY_TIME
            # ... (텍스트 투명도 계산 로직)
            if text_alpha_progress < 0.1:
                text_alpha = int(255 * (text_alpha_progress / 0.1))
            elif text_alpha_progress > 0.9:
                text_alpha = int(255 * ((1 - text_alpha_progress) / 0.1))
            else:
                text_alpha = 255

            text_surface = NARRATIVE_FONT.render("뭔가.. 뭔가 서사잇는 내용..", True, (255, 255, 100))
            text_surface.set_alpha(min(255, max(0, text_alpha)))
            text_rect = text_surface.get_rect(center=(WIDTH // 2, HEIGHT // 2))
            screen.blit(text_surface, text_rect)

        # 3단계: 페이드 인 (검은 화면 -> READY 배경)
        else:
            screen.blit(background_ready, (cam_offset_x, cam_offset_y))

            elapsed_after_narrative = elapsed - (mid_point + NARRATIVE_DISPLAY_TIME)

            fade_in_progress = elapsed_after_narrative / mid_point
            alpha = int(255 * (1 - fade_in_progress)) # 투명도 감소
            fade_surface = fade_img.copy()
            fade_surface.set_alpha(min(255, max(0, alpha)))
            screen.blit(fade_surface, (0, 0))

            # 페이드가 거의 끝나갈 때 플레이어 그리기 시작
            if alpha < 100 and player.alive:
                screen.blit(player.image, (player.rect.x + cam_offset_x, player.rect.y + cam_offset_y))


    elif game_state == READY:
        screen.blit(background_ready, (cam_offset_x, cam_offset_y)) # READY 배경
        if player.alive: screen.blit(player.image, (player.rect.x + cam_offset_x, player.rect.y + cam_offset_y))

    elif game_state == PLAYING or game_state == GAME_OVER:
        screen.blit(background_playing, (cam_offset_x, cam_offset_y)) # 보스전 배경

        if game_state == PLAYING or boss.explosion_particles:
            screen.blit(fairy.image, (fairy.rect.x + cam_offset_x, fairy.rect.y + cam_offset_y)) # 요정
            if player.alive and player.rect.colliderect(fairy.rect):
                draw_text("Press E to Heal (30% HP)", fairy.rect.left - 100 + cam_offset_x,
                          fairy.rect.top - 30 + cam_offset_y, GREEN, SMALL_FONT) # 요정 상호작용 텍스트

            if boss.alive:
                screen.blit(boss.image, (boss.rect.x + cam_offset_x, boss.rect.y + cam_offset_y)) # 보스
                for p in boss.projectiles:
                    # 보스 투사체
                    pygame.draw.rect(screen, p['color'], p['rect'].move(cam_offset_x, cam_offset_y))
            elif boss.explosion_particles:
                # 보스 폭발 파티클
                for p in boss.explosion_particles:
                    pygame.draw.circle(screen, p['color'], (int(p['x'] + cam_offset_x), int(p['y'] + cam_offset_y)),
                                       p['size'])

            if player.alive:
                screen.blit(player.image, (player.rect.x + cam_offset_x, player.rect.y + cam_offset_y)) # 플레이어

            # 플레이어 체력 바 그리기 및 부드러운 감소 업데이트
            smooth_player_hp = draw_bar(20, 20, 220, 28, player.health, player.max_health, GREEN, smooth_player_hp)

        if game_state == GAME_OVER:
            if not player.alive:
                # 플레이어 사망 시 페이드 아웃 및 게임 오버 텍스트
                time_since_death = pygame.time.get_ticks() - player.death_time
                fade_alpha = min(255, int(time_since_death * 0.3))
                fade_surface = fade_img.copy()
                fade_surface.set_alpha(fade_alpha)
                screen.blit(fade_surface, (0, 0))

                if fade_alpha >= 200:
                    text_surface = BIG_FONT.render("플레이어가 쓰러졌습니다...", True, RED)
                    text_rect = text_surface.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 40))
                    screen.blit(text_surface, text_rect)
                    draw_text("R 키를 눌러 다시 시작", WIDTH // 2 - 120, HEIGHT // 2 + 20, WHITE, FONT)

            elif player.alive and not boss.explosion_particles:
                # 보스 클리어 시 텍스트
                clear_surface = BIG_FONT.render("게임 클리어!", True, (255, 255, 100))
                clear_rect = clear_surface.get_rect(center=(WIDTH // 2, HEIGHT // 2 - 40))
                screen.blit(clear_surface, clear_rect)

                if game_clear_time != 0:
                    time_left = max(0, 10 - (current_time - game_clear_time) / 1000)
                    draw_text(f"자동 종료까지 {time_left:.1f}초", WIDTH // 2 - 100, HEIGHT // 2 + 20, WHITE, FONT)

    pygame.display.flip() # 화면 전체 업데이트 (버퍼 스왑)