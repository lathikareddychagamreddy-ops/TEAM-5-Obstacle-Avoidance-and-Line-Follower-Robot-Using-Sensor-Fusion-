/**
 * AUTOBOT - Autonomous Navigation Robot
 * Obstacle Avoidance + Line Following Using Sensor Fusion
 * Modular, performant, deterministic simulation and telemetry engine.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initHeroRadar();
    initArchitectureInspector();
    initHowItWorksSteps();
    initRobotSimulator();
    initSensorFusionArbitrator();
    initArenaSimulator();
});

/* ==========================================================================
   1. NAVIGATION & SCROLL MANAGEMENT
   ========================================================================== */
function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('site-header');
    const backToTopBtn = document.getElementById('back-to-top');

    // Mobile Hamburger Menu
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            mobileToggle.classList.toggle('open');
        });

        // Close mobile menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Header scroll background styling
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.style.background = 'rgba(6, 10, 20, 0.95)';
            header.style.borderBottomColor = 'rgba(0, 240, 255, 0.25)';
        } else {
            header.style.background = 'rgba(8, 13, 26, 0.88)';
            header.style.borderBottomColor = 'rgba(56, 189, 248, 0.15)';
        }
    });

    // Active link highlighting via IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);

    sections.forEach(sec => sectionObserver.observe(sec));

    // Back to Top button
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================================
   2. HERO SECTION RADAR CANVAS VISUALIZATION
   ========================================================================== */
function initHeroRadar() {
    const canvas = document.getElementById('hero-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let angle = 45;
    let sweepDir = 1;
    let distVal = 42;
    const distSpan = document.getElementById('hero-sonar-dist');
    const angleSpan = document.getElementById('hero-servo-angle');

    function drawHeroRadar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height - 30;
        const maxRadius = 200;

        // Draw radar grid arcs
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let r = 50; r <= maxRadius; r += 50) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw radial guide lines (45, 90, 135 deg)
        const radAngles = [Math.PI, 3 * Math.PI / 4, Math.PI / 2, Math.PI / 4, 0];
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        radAngles.forEach(rad => {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(rad) * maxRadius, cy - Math.sin(rad) * maxRadius);
            ctx.stroke();
        });

        // Update sweeping angle (45° to 135°)
        angle += 0.8 * sweepDir;
        if (angle >= 135) sweepDir = -1;
        if (angle <= 45) sweepDir = 1;

        const currentRad = (angle * Math.PI) / 180;

        // Sonar Beam Cone
        const beamSpan = 0.15;
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
        grad.addColorStop(0.7, 'rgba(0, 240, 255, 0.1)');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxRadius, Math.PI + (Math.PI - currentRad) - beamSpan, Math.PI + (Math.PI - currentRad) + beamSpan);
        ctx.closePath();
        ctx.fill();

        // Main Sweep Line
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - Math.cos(currentRad) * maxRadius, cy - Math.sin(currentRad) * maxRadius);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Simulated obstacle ping point
        const obsAngle = 85;
        const obsDist = 120;
        const obsX = cx - Math.cos((obsAngle * Math.PI) / 180) * obsDist;
        const obsY = cy - Math.sin((obsAngle * Math.PI) / 180) * obsDist;

        // Ping blip
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(obsX, obsY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sonar base transducer
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, Math.PI, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Update readouts occasionally
        if (Math.abs(angle - 90) < 5) {
            distVal = 18;
        } else {
            distVal = Math.round(35 + Math.sin(angle * 0.1) * 10);
        }
        
        if (distSpan) distSpan.textContent = `Distance: ${distVal} cm`;
        if (angleSpan) angleSpan.textContent = `Sonar Angle: ${Math.round(angle)}°`;

        requestAnimationFrame(drawHeroRadar);
    }

    drawHeroRadar();
}

/* ==========================================================================
   3. SYSTEM ARCHITECTURE INSPECTOR
   ========================================================================== */
function initArchitectureInspector() {
    const archNodes = document.querySelectorAll('.arch-node');
    const panelTitle = document.getElementById('arch-panel-title');
    const panelBadge = document.getElementById('arch-panel-badge');
    const panelBody = document.getElementById('arch-panel-body');

    const componentData = {
        'ir-sensors': {
            title: 'TCRT5000 Dual IR Sensor Array',
            badge: 'INPUT SENSOR • OPTICAL',
            desc: 'Consists of two downward-facing infrared emitters and phototransistors mounted underneath the chassis. Operates via optical reflectance thresholding: black surfaces absorb IR light, producing digital HIGH signals, while white surfaces reflect IR light, yielding LOW signals. These inputs deliver instant lateral line offset data to the microcontroller.',
            specs: [
                { k: 'Operating Voltage:', v: '3.3V - 5.0V DC' },
                { k: 'Response Time:', v: '< 2.5 microseconds' },
                { k: 'Detection Range:', v: '10 mm - 25 mm' },
                { k: 'Output Type:', v: 'Dual Digital TTL' }
            ]
        },
        'sonar-sensor': {
            title: 'HC-SR04 Ultrasonic Distance Sensor',
            badge: 'INPUT SENSOR • ACOUSTIC',
            desc: 'Emits a 40 kHz ultrasonic burst on command and measures the time interval until the reflected echo pulse returns. Using the speed of sound formula (Distance = Time × 0.0343 / 2), the sensor continuously measures distance to obstacles directly ahead with high precision and low computational cost.',
            specs: [
                { k: 'Ranging Distance:', v: '2 cm - 400 cm' },
                { k: 'Measurement Resolution:', v: '0.3 cm' },
                { k: 'Measuring Angle:', v: '15 degrees cone' },
                { k: 'Trigger Pulse:', v: '10 microsecond TTL' }
            ]
        },
        'servo-motor': {
            title: 'SG90 Micro Servo Motor (Pan Mechanism)',
            badge: 'ACTUATOR • DIRECTIONAL SCANNER',
            desc: 'Carries the HC-SR04 ultrasonic sensor on an articulated mount. When an obstacle is detected, the microcontroller commands the servo to rotate from 90° (center) to 45° (left) and 135° (right) to evaluate spatial clearance in both lateral quadrants before committing to an avoidance maneuver.',
            specs: [
                { k: 'Rotation Angle:', v: '0° - 180° Range' },
                { k: 'Operating Speed:', v: '0.10s / 60 degrees' },
                { k: 'Control Interface:', v: '50 Hz PWM Pulse' },
                { k: 'Stall Torque:', v: '1.8 kg·cm' }
            ]
        },
        'mcu': {
            title: 'Microcontroller Unit (Arduino / ESP32)',
            badge: 'PROCESSING • EMBEDDED CONTROLLER',
            desc: 'The central embedded processor executing the deterministic control loop at 16 MHz / 240 MHz. Continuously handles digital GPIO reads from IR sensors, timer-based ultrasonic echo sampling, non-blocking servo pulse generation, and motor PWM generation via the L298N driver.',
            specs: [
                { k: 'Clock Frequency:', v: '16 MHz (Uno) / 240 MHz (ESP32)' },
                { k: 'Cycle Frequency:', v: '100 Hz Loop (10ms)' },
                { k: 'PWM Timers:', v: 'Hardware 8-bit / 16-bit' },
                { k: 'Firmware:', v: 'Bare-Metal Embedded C/C++' }
            ]
        },
        'sensor-fusion-engine': {
            title: 'Sensor Fusion & State Matrix',
            badge: 'ALGORITHM • REAL-TIME FUSION',
            desc: 'Fuses heterogeneous sensory feeds: microsecond optical binary data from IR sensors, acoustic time-of-flight depth from the sonar, and angular spatial orientation from the servo pan head. Merges these inputs into a coherent spatial state vector evaluated on every execution tick.',
            specs: [
                { k: 'Fusion Architecture:', v: 'Deterministic Priority Fusion' },
                { k: 'Input Channels:', v: '2x Digital IR, 1x Acoustic Echo, 1x Angle' },
                { k: 'Inference Latency:', v: '< 1.2 milliseconds' },
                { k: 'Conflict Arbitration:', v: 'Safety Critical Preemption' }
            ]
        },
        'fsm-engine': {
            title: 'Finite State Machine (FSM)',
            badge: 'CONTROL LOGIC • STATE ENGINE',
            desc: 'A robust finite state machine that guarantees deterministic transitions between LINE_FOLLOW, OBSTACLE_DETECTED, STOP_SCAN, AVOID, SEARCH_LINE, and RESUME. Obstacle detection acts as a high-priority hardware interrupt, immediately overriding normal line tracking routines.',
            specs: [
                { k: 'States Count:', v: '6 Deterministic States' },
                { k: 'Priority Policy:', v: 'Obstacle Avoidance > Line Follow' },
                { k: 'Fail-Safe Mode:', v: 'Full Motor Stop on Fault' },
                { k: 'Loop Execution:', v: 'Deterministic non-blocking' }
            ]
        },
        'motor-driver': {
            title: 'L298N Dual H-Bridge Motor Driver',
            badge: 'ACTUATION • POWER INTERFACE',
            desc: 'Bridges low-current 5V logic signals from the microcontroller to high-current power for the dual DC motors. Features dual full-bridge bipolar transistors capable of bidirectional direction control and pulse-width modulation (PWM) speed regulation.',
            specs: [
                { k: 'Driver Chip:', v: 'L298N Dual H-Bridge' },
                { k: 'Peak Output Current:', v: '2.0A per channel' },
                { k: 'Logic Voltage:', v: '5V TTL Compatible' },
                { k: 'Speed Regulation:', v: 'PWM Duty Cycle 0-255' }
            ]
        },
        'dc-motors': {
            title: 'Dual Geared DC Drive Motors + Wheels',
            badge: 'KINEMATICS • DIFFERENTIAL DRIVE',
            desc: 'Two 1:48 gear ratio DC motors driving left and right rubber wheels, balanced by a front omnidirectional ball caster. Differential steering enables zero-radius pivoting, sharp turn execution, and smooth curved bypass arcs during obstacle avoidance.',
            specs: [
                { k: 'Gear Reduction:', v: '1:48 Internal Gearbox' },
                { k: 'No-Load Speed:', v: '200 RPM @ 6V' },
                { k: 'Drive Mechanism:', v: 'Differential 2WD + Caster' },
                { k: 'Traction:', v: 'High-Grip Rubber Treads' }
            ]
        }
    };

    archNodes.forEach(node => {
        node.addEventListener('click', () => {
            archNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            const key = node.getAttribute('data-node');
            const data = componentData[key];
            if (!data) return;

            panelTitle.textContent = data.title;
            panelBadge.textContent = data.badge;
            
            let specsHTML = data.specs.map(s => `
                <div class="spec-row">
                    <span class="spec-k">${s.k}</span>
                    <span class="spec-v">${s.v}</span>
                </div>
            `).join('');

            panelBody.innerHTML = `
                <p class="panel-description">${data.desc}</p>
                <div class="panel-specs-grid">${specsHTML}</div>
            `;
        });
    });
}

/* ==========================================================================
   4. HOW IT WORKS - 6-STEP INTERACTIVE VISUALIZER
   ========================================================================== */
function initHowItWorksSteps() {
    const stepTabs = document.querySelectorAll('.step-tab');
    const stepCanvas = document.getElementById('step-canvas');
    const badge = document.getElementById('step-card-badge');
    const title = document.getElementById('step-card-title');
    const desc = document.getElementById('step-card-desc');
    const logic = document.getElementById('step-card-logic');
    const prevBtn = document.getElementById('step-prev-btn');
    const nextBtn = document.getElementById('step-next-btn');

    if (!stepCanvas) return;
    const ctx = stepCanvas.getContext('2d');

    let currentStep = 1;

    const stepsData = {
        1: {
            badge: 'STEP 1 OF 6',
            title: 'Line Detection',
            desc: 'Dual downward-facing infrared sensors continuously measure surface reflectance. The black line absorbs IR light while the white surface reflects it, producing high/low digital logic signals that define the robot\'s lateral alignment relative to the center track.',
            logic: 'Left IR: HIGH | Right IR: HIGH → Track Centered'
        },
        2: {
            badge: 'STEP 2 OF 6',
            title: 'Line Following & Differential Steering',
            desc: 'When the robot drifts off-center, one IR sensor drops off the black track. The microcontroller immediately calculates error and adjusts the PWM duty cycle to the left or right DC motor, executing differential steering to re-center the robot.',
            logic: 'Left IR: LOW | Right IR: HIGH → Steer Left (M_Left: 120, M_Right: 210)'
        },
        3: {
            badge: 'STEP 3 OF 6',
            title: 'Obstacle Detection',
            desc: 'While tracking the line, the HC-SR04 ultrasonic sensor continuously emits 40 kHz acoustic pulses. When an echo returns in under 1.16 milliseconds, the calculated distance drops below the 20 cm threshold, triggering an immediate obstacle interrupt.',
            logic: 'Sonar Dist: 14 cm (< 20 cm safety limit) → TRIGGER INTERRUPT'
        },
        4: {
            badge: 'STEP 4 OF 6',
            title: 'Stop & Scan Lateral Quadrants',
            desc: 'The motor driver immediately cuts PWM power to both DC motors. The SG90 servo motor pans the ultrasonic transducer 45° to the left and 135° to the right, measuring spatial clearance in both prospective bypass corridors.',
            logic: 'Left Dist: 38 cm | Right Dist: 12 cm → Left Path has > 25cm Clearance'
        },
        5: {
            badge: 'STEP 5 OF 6',
            title: 'Decision & Avoidance Bypass Arc',
            desc: 'The sensor fusion engine selects the corridor with superior clearance. The controller applies asymmetrical PWM to execute a smooth curved arc around the obstacle, bypassing the obstruction while keeping safe lateral distance.',
            logic: 'Decision: AVOID_LEFT → Execute Arc Bypass (PWM M_L: 140, M_R: 220)'
        },
        6: {
            badge: 'STEP 6 OF 6',
            title: 'Reacquire Line & Resume Mission',
            desc: 'Once the robot clears the obstacle perimeter, it turns inward toward the estimated line vector with IR sensors primed. The instant either IR sensor detects the black track, the robot realigns wheels to 0° and resumes standard line following.',
            logic: 'IR Sensor Hit: HIGH → Lock to Track → State: LINE_FOLLOW'
        }
    };

    function renderStepCanvas(step) {
        ctx.clearRect(0, 0, stepCanvas.width, stepCanvas.height);
        const w = stepCanvas.width;
        const h = stepCanvas.height;

        // Background
        ctx.fillStyle = '#060a14';
        ctx.fillRect(0, 0, w, h);

        // Draw track line
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(30, h / 2);
        ctx.lineTo(w - 30, h / 2);
        ctx.stroke();

        // Draw center dashed track line
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(30, h / 2);
        ctx.lineTo(w - 30, h / 2);
        ctx.stroke();

        // Draw step specific elements
        if (step === 1 || step === 2) {
            // Robot on track
            const rx = step === 1 ? w / 2 : w / 2 - 30;
            const ry = step === 1 ? h / 2 : h / 2 + 12;

            drawMiniRobot(ctx, rx, ry, step === 1 ? 0 : -0.15, step === 1);
            
            // Text annotation
            ctx.fillStyle = '#00f0ff';
            ctx.font = '12px "JetBrains Mono"';
            ctx.fillText(step === 1 ? 'DUAL IR SENSORS ON LINE' : 'DIFFERENTIAL CORRECTION ACTIVE', 40, 40);
        } else if (step === 3) {
            // Obstacle in path
            const rx = 120;
            const ry = h / 2;
            const ox = 260;
            const oy = h / 2;

            drawObstacle(ctx, ox, oy);
            drawMiniRobot(ctx, rx, ry, 0, true);

            // Sonar Beam to obstacle
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(rx + 25, ry);
            ctx.lineTo(ox - 10, oy - 20);
            ctx.lineTo(ox - 10, oy + 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = '12px "JetBrains Mono"';
            ctx.fillText('OBSTACLE DETECTED < 20cm! HALT MOTORS', 40, 40);
        } else if (step === 4) {
            // Stop & Scan
            const rx = 140;
            const ry = h / 2;
            const ox = 280;
            const oy = h / 2;

            drawObstacle(ctx, ox, oy);
            drawMiniRobot(ctx, rx, ry, 0, false);

            // Sonar Pan left beam
            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.strokeStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(rx + 25, ry);
            ctx.lineTo(rx + 110, ry - 60);
            ctx.lineTo(rx + 140, ry - 40);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Sonar Pan right beam (blocked)
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.strokeStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(rx + 25, ry);
            ctx.lineTo(rx + 110, ry + 60);
            ctx.lineTo(rx + 140, ry + 40);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.font = '12px "JetBrains Mono"';
            ctx.fillText('SERVO SCAN: LEFT CLEAR (42cm), RIGHT BLOCKED (10cm)', 40, 40);
        } else if (step === 5) {
            // Avoidance arc
            const ox = 240;
            const oy = h / 2;
            drawObstacle(ctx, ox, oy);

            // Arc path
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(100, h / 2);
            ctx.quadraticCurveTo(240, h / 2 - 80, 360, h / 2 - 20);
            ctx.stroke();
            ctx.setLineDash([]);

            drawMiniRobot(ctx, 240, h / 2 - 60, -0.25, false);

            ctx.fillStyle = '#f59e0b';
            ctx.font = '12px "JetBrains Mono"';
            ctx.fillText('EXECUTING LATERAL BYPASS ARC', 40, 40);
        } else if (step === 6) {
            // Reacquire line
            const ox = 180;
            const oy = h / 2;
            drawObstacle(ctx, ox, oy);

            drawMiniRobot(ctx, 330, h / 2, 0, true);

            // Green lock pulses
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(330, h / 2, 30, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.font = '12px "JetBrains Mono"';
            ctx.fillText('TRACK REACQUIRED! RESUMING NORMAL LINE FOLLOWING', 40, 40);
        }
    }

    function drawMiniRobot(context, x, y, rot, irActive) {
        context.save();
        context.translate(x, y);
        context.rotate(rot);

        // Body
        context.fillStyle = '#1e293b';
        context.strokeStyle = '#00f0ff';
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(-24, -18, 48, 36, 6);
        context.fill();
        context.stroke();

        // Wheels
        context.fillStyle = '#0f172a';
        context.strokeStyle = '#38bdf8';
        context.lineWidth = 1.5;
        context.fillRect(-16, -24, 18, 5);
        context.strokeRect(-16, -24, 18, 5);
        context.fillRect(-16, 19, 18, 5);
        context.strokeRect(-16, 19, 18, 5);

        // IR Probes
        context.fillStyle = irActive ? '#10b981' : '#64748b';
        context.beginPath();
        context.arc(16, -8, 3, 0, Math.PI * 2);
        context.arc(16, 8, 3, 0, Math.PI * 2);
        context.fill();

        // Sonar Eyes
        context.fillStyle = '#38bdf8';
        context.fillRect(20, -6, 5, 4);
        context.fillRect(20, 2, 5, 4);

        context.restore();
    }

    function drawObstacle(context, x, y) {
        context.fillStyle = '#dc2626';
        context.strokeStyle = '#ef4444';
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(x - 18, y - 18, 36, 36, 6);
        context.fill();
        context.stroke();

        context.fillStyle = '#ffffff';
        context.font = 'bold 11px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('OBST', x, y);
        context.textAlign = 'start';
    }

    function updateStepUI(stepNum) {
        currentStep = stepNum;
        const d = stepsData[stepNum];
        if (!d) return;

        badge.textContent = d.badge;
        title.textContent = d.title;
        desc.textContent = d.desc;
        logic.textContent = d.logic;

        stepTabs.forEach(t => {
            const active = parseInt(t.getAttribute('data-step')) === stepNum;
            t.classList.toggle('active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        prevBtn.disabled = stepNum === 1;
        nextBtn.disabled = stepNum === 6;

        renderStepCanvas(stepNum);
    }

    stepTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const s = parseInt(tab.getAttribute('data-step'));
            updateStepUI(s);
        });
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) updateStepUI(currentStep - 1);
    });

    nextBtn.addEventListener('click', () => {
        if (currentStep < 6) updateStepUI(currentStep + 1);
    });

    updateStepUI(1);
}

/* ==========================================================================
   5. INTERACTIVE 2D ROBOT SIMULATOR (CORE ENGINE)
   ========================================================================== */
function initRobotSimulator() {
    const canvas = document.getElementById('sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Controls
    const btnStart = document.getElementById('sim-btn-start');
    const btnPause = document.getElementById('sim-btn-pause');
    const btnReset = document.getElementById('sim-btn-reset');
    const speedButtons = document.querySelectorAll('.speed-btn');
    const obstacleSelect = document.getElementById('obstacle-pos-select');
    const overlay = document.getElementById('sim-canvas-overlay');
    const overlayMsg = document.getElementById('sim-overlay-msg');
    const runStateBadge = document.getElementById('sim-run-state');

    // Telemetry DOM
    const tMode = document.getElementById('t-mode');
    const tDistance = document.getElementById('t-distance');
    const tDistBar = document.getElementById('t-dist-bar');
    const tServoNeedle = document.getElementById('t-servo-needle');
    const tServoAngle = document.getElementById('t-servo-angle');
    const tServoDir = document.getElementById('t-servo-dir');
    const tIrLeft = document.getElementById('t-ir-left');
    const tIrLeftVal = document.getElementById('t-ir-left-val');
    const tIrRight = document.getElementById('t-ir-right');
    const tIrRightVal = document.getElementById('t-ir-right-val');
    const tPwmLeft = document.getElementById('t-pwm-left');
    const tPwmLeftBar = document.getElementById('t-pwm-left-bar');
    const tPwmRight = document.getElementById('t-pwm-right');
    const tPwmRightBar = document.getElementById('t-pwm-right-bar');
    const tDecision = document.getElementById('t-decision');
    const tDecisionReason = document.getElementById('t-decision-reason');
    const eventLog = document.getElementById('sim-event-log');
    const modeBadge = document.getElementById('telemetry-mode-badge');

    // FSM DOM Nodes for Synchronization
    const fsmNodes = {
        'LINE_FOLLOW': document.getElementById('fsm-node-line-follow'),
        'OBSTACLE_DETECTED': document.getElementById('fsm-node-obstacle-detected'),
        'STOP_SCAN': document.getElementById('fsm-node-stop-scan'),
        'AVOID': document.getElementById('fsm-node-avoid'),
        'SEARCH_LINE': document.getElementById('fsm-node-search-line'),
        'RESUME': document.getElementById('fsm-node-resume')
    };

    // Simulation State Machine constants
    const STATES = {
        LINE_FOLLOW: 'LINE_FOLLOW',
        OBSTACLE_DETECTED: 'OBSTACLE_DETECTED',
        STOP_SCAN: 'STOP_SCAN',
        AVOID: 'AVOID',
        SEARCH_LINE: 'SEARCH_LINE',
        RESUME: 'RESUME'
    };

    let isRunning = false;
    let isPaused = false;
    let speedMult = 1.0;
    let animationFrameId = null;

    // Track definition: smooth looped circuit or horizontal track
    const trackWidth = 24;
    const trackPath = [
        { x: 60, y: 240 },
        { x: 260, y: 240 },
        { x: 440, y: 240 },
        { x: 620, y: 240 },
        { x: 740, y: 240 }
    ];

    // Obstacle setup
    let obstacleScenario = 'center';
    let obstacle = { x: 380, y: 240, radius: 24, active: true };

    // Robot Kinematic State
    let robot = {
        x: 80,
        y: 240,
        heading: 0, // radians
        speed: 0,
        targetSpeed: 1.6,
        servoAngle: 90, // degrees (90 = straight)
        state: STATES.LINE_FOLLOW,
        stateTimer: 0,
        scanPhase: 0, // 0: sweep left, 1: sweep right, 2: decide
        leftClearance: 0,
        rightClearance: 0,
        avoidDirection: 'left', // 'left' or 'right'
        avoidStep: 0,
        irLeft: true,
        irRight: true,
        distToObstacle: 99,
        pwmL: 180,
        pwmR: 180
    };

    function resetSimulation() {
        isRunning = false;
        isPaused = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        robot.x = 80;
        robot.y = 240;
        robot.heading = 0;
        robot.speed = 0;
        robot.servoAngle = 90;
        robot.state = STATES.LINE_FOLLOW;
        robot.stateTimer = 0;
        robot.scanPhase = 0;
        robot.avoidStep = 0;
        robot.irLeft = true;
        robot.irRight = true;
        robot.distToObstacle = 99;
        robot.pwmL = 0;
        robot.pwmR = 0;

        updateObstaclePosition();

        btnStart.disabled = false;
        btnPause.disabled = true;
        runStateBadge.textContent = 'STANDBY';
        runStateBadge.style.color = 'var(--text-secondary)';
        overlay.style.display = 'block';
        overlayMsg.textContent = 'READY - PRESS START';
        
        updateTelemetry();
        renderSimulator();
        addLogEntry('[SYSTEM] Reset complete. Telemetry ready.');
    }

    function updateObstaclePosition() {
        obstacleScenario = obstacleSelect.value;
        if (obstacleScenario === 'center') {
            obstacle.x = 380;
            obstacle.y = 240;
            obstacle.active = true;
        } else if (obstacleScenario === 'left-bias') {
            obstacle.x = 380;
            obstacle.y = 222;
            obstacle.active = true;
        } else if (obstacleScenario === 'right-bias') {
            obstacle.x = 380;
            obstacle.y = 258;
            obstacle.active = true;
        } else if (obstacleScenario === 'clear') {
            obstacle.active = false;
        }
    }

    function addLogEntry(text) {
        if (!eventLog) return;
        const line = document.createElement('div');
        line.className = 'log-line';
        line.textContent = text;
        eventLog.appendChild(line);
        eventLog.scrollTop = eventLog.scrollHeight;
    }

    function updateTelemetry() {
        tMode.textContent = robot.state.replace('_', ' ');
        modeBadge.textContent = isRunning ? (isPaused ? 'PAUSED' : 'ACTIVE') : 'STANDBY';

        const displayDist = Math.min(99, Math.round(robot.distToObstacle));
        tDistance.textContent = displayDist;
        tDistBar.style.width = `${Math.min(100, displayDist * 1.5)}%`;
        if (displayDist < 20) {
            tDistBar.style.background = 'var(--danger-accent)';
        } else if (displayDist < 40) {
            tDistBar.style.background = 'var(--warn-accent)';
        } else {
            tDistBar.style.background = 'var(--cyan-accent)';
        }

        // Servo gauge
        tServoAngle.textContent = `${Math.round(robot.servoAngle)}°`;
        const needleAngle = robot.servoAngle - 90;
        tServoNeedle.style.transform = `rotate(${needleAngle}deg)`;
        tServoDir.textContent = robot.servoAngle > 105 ? 'RIGHT' : (robot.servoAngle < 75 ? 'LEFT' : 'AHEAD');

        // IR Sensors
        tIrLeft.classList.toggle('active', robot.irLeft);
        tIrLeftVal.textContent = robot.irLeft ? 'ACTIVE' : 'OFF LINE';
        tIrRight.classList.toggle('active', robot.irRight);
        tIrRightVal.textContent = robot.irRight ? 'ACTIVE' : 'OFF LINE';

        // PWM Motors
        tPwmLeft.textContent = `${Math.round(robot.pwmL)} / 255`;
        tPwmLeftBar.style.width = `${(robot.pwmL / 255) * 100}%`;
        tPwmRight.textContent = `${Math.round(robot.pwmR)} / 255`;
        tPwmRightBar.style.width = `${(robot.pwmR / 255) * 100}%`;

        // Decision output
        if (robot.state === STATES.LINE_FOLLOW) {
            tDecision.textContent = 'FOLLOW LINE';
            tDecisionReason.textContent = 'Dual IR aligned with track line. Sonar clear.';
        } else if (robot.state === STATES.OBSTACLE_DETECTED) {
            tDecision.textContent = 'OBSTACLE STOP';
            tDecisionReason.textContent = `Sonar echo < 20cm (${displayDist}cm). Brakes engaged.`;
        } else if (robot.state === STATES.STOP_SCAN) {
            tDecision.textContent = 'SCANNING CORRIDORS';
            tDecisionReason.textContent = 'Servo panning left (45°) and right (135°) measuring clearance.';
        } else if (robot.state === STATES.AVOID) {
            tDecision.textContent = `BYPASS ${robot.avoidDirection.toUpperCase()}`;
            tDecisionReason.textContent = `Safest corridor chosen (${robot.avoidDirection.toUpperCase()}). Executing bypass arc.`;
        } else if (robot.state === STATES.SEARCH_LINE) {
            tDecision.textContent = 'SEARCH LINE';
            tDecisionReason.textContent = 'Obstacle cleared. Inward vector active to re-detect track.';
        } else if (robot.state === STATES.RESUME) {
            tDecision.textContent = 'LOCK & RESUME';
            tDecisionReason.textContent = 'IR sensor detected track! Realigning heading to 0°.';
        }

        // Synchronize FSM node highlights
        Object.keys(fsmNodes).forEach(k => {
            if (fsmNodes[k]) {
                fsmNodes[k].classList.toggle('active', k === robot.state);
            }
        });
    }

    // Main Physics & FSM Step Loop
    function updateSimulationLogic() {
        if (!isRunning || isPaused) return;

        const effectiveSpeed = robot.targetSpeed * speedMult;

        // 1. Calculate distance from front sonar to obstacle
        if (obstacle.active) {
            const frontX = robot.x + Math.cos(robot.heading) * 22;
            const frontY = robot.y + Math.sin(robot.heading) * 22;
            const dx = obstacle.x - frontX;
            const dy = obstacle.y - frontY;
            const dist = Math.sqrt(dx * dx + dy * dy) - obstacle.radius;
            robot.distToObstacle = Math.max(0, dist / 2.8); // scaled to cm
        } else {
            robot.distToObstacle = 99;
        }

        // 2. FSM Execution
        switch (robot.state) {
            case STATES.LINE_FOLLOW:
                robot.servoAngle = 90;
                robot.pwmL = 185;
                robot.pwmR = 185;
                robot.speed = effectiveSpeed;

                // Line tracking check (track is at y = 240)
                const lineError = robot.y - 240;
                if (Math.abs(lineError) > 3) {
                    robot.heading = -lineError * 0.05;
                } else {
                    robot.heading = 0;
                }

                robot.irLeft = Math.abs(robot.y - 240) < 14;
                robot.irRight = Math.abs(robot.y - 240) < 14;

                robot.x += Math.cos(robot.heading) * robot.speed;
                robot.y += Math.sin(robot.heading) * robot.speed;

                // Check obstacle interrupt
                if (obstacle.active && robot.distToObstacle <= 20 && robot.x < obstacle.x) {
                    robot.state = STATES.OBSTACLE_DETECTED;
                    robot.speed = 0;
                    robot.pwmL = 0;
                    robot.pwmR = 0;
                    robot.stateTimer = 0;
                    addLogEntry(`[ALERT] Obstacle detected at ${Math.round(robot.distToObstacle)} cm! Halting motors.`);
                }

                // Loop track wrap around
                if (robot.x > 750) {
                    robot.x = 70;
                    robot.y = 240;
                    robot.heading = 0;
                    addLogEntry('[TRACK] Lap completed. Re-entering start gate.');
                }
                break;

            case STATES.OBSTACLE_DETECTED:
                robot.speed = 0;
                robot.pwmL = 0;
                robot.pwmR = 0;
                robot.stateTimer += 1;
                if (robot.stateTimer > 20 / speedMult) {
                    robot.state = STATES.STOP_SCAN;
                    robot.stateTimer = 0;
                    robot.scanPhase = 0;
                    addLogEntry('[FSM] Transition to STOP_SCAN. Actuating servo.');
                }
                break;

            case STATES.STOP_SCAN:
                robot.speed = 0;
                robot.pwmL = 0;
                robot.pwmR = 0;
                robot.stateTimer += 1;

                if (robot.scanPhase === 0) {
                    // Sweep left (45 deg)
                    robot.servoAngle = 45;
                    if (robot.stateTimer > 35 / speedMult) {
                        robot.leftClearance = obstacleScenario === 'left-bias' ? 14 : 48;
                        addLogEntry(`[SCAN] Left Quadrant Clearance: ${robot.leftClearance} cm`);
                        robot.scanPhase = 1;
                        robot.stateTimer = 0;
                    }
                } else if (robot.scanPhase === 1) {
                    // Sweep right (135 deg)
                    robot.servoAngle = 135;
                    if (robot.stateTimer > 35 / speedMult) {
                        robot.rightClearance = obstacleScenario === 'right-bias' ? 12 : 52;
                        addLogEntry(`[SCAN] Right Quadrant Clearance: ${robot.rightClearance} cm`);
                        robot.scanPhase = 2;
                        robot.stateTimer = 0;
                    }
                } else if (robot.scanPhase === 2) {
                    // Evaluate
                    robot.servoAngle = 90;
                    if (obstacleScenario === 'left-bias') {
                        robot.avoidDirection = 'right';
                    } else if (obstacleScenario === 'right-bias') {
                        robot.avoidDirection = 'left';
                    } else {
                        robot.avoidDirection = 'left'; // Default safe path
                    }
                    
                    robot.state = STATES.AVOID;
                    robot.avoidStep = 0;
                    robot.stateTimer = 0;
                    addLogEntry(`[DECISION] Fused Decision: Bypass via ${robot.avoidDirection.toUpperCase()} corridor.`);
                }
                break;

            case STATES.AVOID:
                robot.speed = effectiveSpeed * 0.9;
                robot.stateTimer += 1;

                const dirSign = robot.avoidDirection === 'left' ? -1 : 1;

                // Step 0: Turn outward
                if (robot.avoidStep === 0) {
                    robot.heading = dirSign * 0.65;
                    robot.pwmL = dirSign === -1 ? 110 : 210;
                    robot.pwmR = dirSign === -1 ? 210 : 110;
                    robot.irLeft = false;
                    robot.irRight = false;
                    if (Math.abs(robot.y - 240) > 65) {
                        robot.avoidStep = 1;
                        robot.stateTimer = 0;
                    }
                }
                // Step 1: Drive parallel past the obstacle
                else if (robot.avoidStep === 1) {
                    robot.heading = 0;
                    robot.pwmL = 175;
                    robot.pwmR = 175;
                    if (robot.x > obstacle.x + 35) {
                        robot.avoidStep = 2;
                        robot.stateTimer = 0;
                        robot.state = STATES.SEARCH_LINE;
                        addLogEntry('[FSM] Obstacle cleared laterally. Searching for line.');
                    }
                }

                robot.x += Math.cos(robot.heading) * robot.speed;
                robot.y += Math.sin(robot.heading) * robot.speed;
                break;

            case STATES.SEARCH_LINE:
                robot.speed = effectiveSpeed * 0.85;
                const returnSign = robot.avoidDirection === 'left' ? 1 : -1;
                robot.heading = returnSign * 0.6;
                robot.pwmL = 160;
                robot.pwmR = 160;

                robot.x += Math.cos(robot.heading) * robot.speed;
                robot.y += Math.sin(robot.heading) * robot.speed;

                // Check IR detection of line
                if (Math.abs(robot.y - 240) <= 8) {
                    robot.irLeft = true;
                    robot.irRight = true;
                    robot.state = STATES.RESUME;
                    robot.stateTimer = 0;
                    addLogEntry('[LINE SENSE] Dual IR signal locked on track! Realigning.');
                }
                break;

            case STATES.RESUME:
                robot.speed = effectiveSpeed * 0.7;
                robot.heading = 0;
                robot.y = 240;
                robot.pwmL = 180;
                robot.pwmR = 180;
                robot.stateTimer += 1;

                robot.x += Math.cos(robot.heading) * robot.speed;

                if (robot.stateTimer > 25 / speedMult) {
                    robot.state = STATES.LINE_FOLLOW;
                    addLogEntry('[FSM] Rejoined track successfully. State: LINE_FOLLOW.');
                }
                break;
        }

        updateTelemetry();
    }

    // Render Canvas Visuals
    function renderSimulator() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        // 1. Grid Background
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
        ctx.lineWidth = 1;
        const gridStep = 40;
        for (let gx = 0; gx <= w; gx += gridStep) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, h);
            ctx.stroke();
        }
        for (let gy = 0; gy <= h; gy += gridStep) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
        }

        // 2. Safe bypass boundaries
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(40, 160);
        ctx.lineTo(w - 40, 160);
        ctx.moveTo(40, 320);
        ctx.lineTo(w - 40, 320);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('LEFT BYPASS CORRIDOR', 50, 150);
        ctx.fillText('RIGHT BYPASS CORRIDOR', 50, 335);

        // 3. Track (Road surface + Black line)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(40, 240 - trackWidth / 2, w - 80, trackWidth);

        // Black Line Track
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(40, 240);
        ctx.lineTo(w - 40, 240);
        ctx.stroke();

        // Neon guideline center
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 240);
        ctx.lineTo(w - 40, 240);
        ctx.stroke();

        // Start / Finish Markings
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(60, 215, 4, 50);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillText('START', 48, 205);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(w - 60, 215, 4, 50);
        ctx.fillText('GATE', w - 74, 205);

        // 4. Obstacle Rendering
        if (obstacle.active) {
            ctx.save();
            ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
            ctx.shadowBlur = 14;

            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(obstacle.x - obstacle.radius, obstacle.y - obstacle.radius, obstacle.radius * 2, obstacle.radius * 2, 8);
            ctx.fill();
            ctx.stroke();

            // Hazard stripes
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obstacle.x - 14, obstacle.y - 14);
            ctx.lineTo(obstacle.x + 14, obstacle.y + 14);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('OBST', obstacle.x, obstacle.y);
            ctx.restore();
        }

        // 5. Robot Vehicle Rendering
        ctx.save();
        ctx.translate(robot.x, robot.y);
        ctx.rotate(robot.heading);

        // Sonar scanning cone
        const sonarAngleRad = ((robot.servoAngle - 90) * Math.PI) / 180;
        const coneDist = Math.min(160, robot.distToObstacle * 2.8 + 20);
        const coneSpan = 0.28;

        const sonarGrad = ctx.createRadialGradient(24, 0, 5, 24, 0, coneDist);
        if (robot.distToObstacle < 20) {
            sonarGrad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
            sonarGrad.addColorStop(1, 'transparent');
        } else {
            sonarGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
            sonarGrad.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = sonarGrad;
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.arc(24, 0, coneDist, sonarAngleRad - coneSpan, sonarAngleRad + coneSpan);
        ctx.closePath();
        ctx.fill();

        // Chassis body
        ctx.shadowColor = 'rgba(0, 240, 255, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#152238';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-30, -22, 60, 44, 8);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Drive Wheels (Left & Right)
        ctx.fillStyle = '#0a0f1d';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        // Left wheel
        ctx.fillRect(-18, -30, 24, 7);
        ctx.strokeRect(-18, -30, 24, 7);
        // Right wheel
        ctx.fillRect(-18, 23, 24, 7);
        ctx.strokeRect(-18, 23, 24, 7);

        // Front Ball Caster
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(22, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Dual IR Line Probes
        ctx.fillStyle = robot.irLeft ? '#10b981' : '#ef4444';
        ctx.shadowColor = robot.irLeft ? '#10b981' : '#ef4444';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(20, -10, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = robot.irRight ? '#10b981' : '#ef4444';
        ctx.shadowColor = robot.irRight ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(20, 10, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Servo Turret & Sonar Eyes
        ctx.save();
        ctx.translate(22, 0);
        ctx.rotate(sonarAngleRad);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-4, -10, 8, 20);
        ctx.strokeRect(-4, -10, 8, 20);

        // Ultrasonic transducers (eyes)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(4, -5, 3.5, 0, Math.PI * 2);
        ctx.arc(4, 5, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Microcontroller chip on chassis
        ctx.fillStyle = '#0e1626';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.fillRect(-14, -10, 20, 20);
        ctx.strokeRect(-14, -10, 20, 20);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '7px "JetBrains Mono"';
        ctx.fillText('MCU', -10, 3);

        ctx.restore();
    }

    // Animation Tick
    function simLoop() {
        updateSimulationLogic();
        renderSimulator();
        if (isRunning && !isPaused) {
            animationFrameId = requestAnimationFrame(simLoop);
        }
    }

    // Controls Event Listeners
    btnStart.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            isPaused = false;
            btnStart.disabled = true;
            btnPause.disabled = false;
            runStateBadge.textContent = 'RUNNING';
            runStateBadge.style.color = 'var(--emerald-accent)';
            overlay.style.display = 'none';
            addLogEntry('[COMMAND] Simulation STARTED.');
            simLoop();
        } else if (isPaused) {
            isPaused = false;
            btnStart.disabled = true;
            btnPause.disabled = false;
            runStateBadge.textContent = 'RUNNING';
            runStateBadge.style.color = 'var(--emerald-accent)';
            overlay.style.display = 'none';
            addLogEntry('[COMMAND] Simulation RESUMED.');
            simLoop();
        }
    });

    btnPause.addEventListener('click', () => {
        if (isRunning && !isPaused) {
            isPaused = true;
            btnStart.disabled = false;
            btnPause.disabled = true;
            runStateBadge.textContent = 'PAUSED';
            runStateBadge.style.color = 'var(--warn-accent)';
            overlay.style.display = 'block';
            overlayMsg.textContent = 'SIMULATION PAUSED';
            addLogEntry('[COMMAND] Simulation PAUSED.');
        }
    });

    btnReset.addEventListener('click', () => {
        resetSimulation();
    });

    speedButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            speedButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            speedMult = parseFloat(btn.getAttribute('data-speed'));
            addLogEntry(`[SPEED] Multiplier set to ${speedMult}x`);
        });
    });

    obstacleSelect.addEventListener('change', () => {
        updateObstaclePosition();
        renderSimulator();
        addLogEntry(`[SCENARIO] Obstacle preset updated to: ${obstacleSelect.value}`);
    });

    // Initial render
    resetSimulation();
}

/* ==========================================================================
   6. SENSOR FUSION INTERACTIVE ARBITRATOR
   ========================================================================== */
function initSensorFusionArbitrator() {
    const distSlider = document.getElementById('fusion-dist-slider');
    const distVal = document.getElementById('fusion-dist-val');
    const irLeftBtn = document.getElementById('fusion-ir-left-btn');
    const irRightBtn = document.getElementById('fusion-ir-right-btn');
    const outDecision = document.getElementById('fusion-out-decision');
    const outDesc = document.getElementById('fusion-out-desc');

    if (!distSlider || !irLeftBtn || !irRightBtn) return;

    let leftOn = true;
    let rightOn = true;

    function evaluateFusion() {
        const distance = parseInt(distSlider.value);
        distVal.textContent = `${distance} cm`;

        if (distance <= 20) {
            outDecision.textContent = 'OBSTACLE_STOP & SCAN (PRIORITY OVERRIDE)';
            outDecision.style.color = 'var(--danger-accent)';
            outDesc.textContent = `Sonar echo (${distance} cm) is below the critical 20 cm safety threshold. The FSM preempts line tracking, applies zero PWM to stop motors, and initiates directional servo scanning.`;
        } else if (leftOn && rightOn) {
            outDecision.textContent = 'LINE_FOLLOW (FORWARD)';
            outDecision.style.color = 'var(--cyan-accent)';
            outDesc.textContent = `Path ahead is unobstructed (${distance} cm). Both IR sensors detect track. Symmetric PWM (185/185) applied to Left and Right DC motors.`;
        } else if (leftOn && !rightOn) {
            outDecision.textContent = 'LINE_FOLLOW (CORRECT STEER LEFT)';
            outDecision.style.color = 'var(--blue-accent)';
            outDesc.textContent = `Right IR sensor drifted off the line. Microcontroller applies differential PWM (M_Left: 120, M_Right: 210) to steer robot back toward center track.`;
        } else if (!leftOn && rightOn) {
            outDecision.textContent = 'LINE_FOLLOW (CORRECT STEER RIGHT)';
            outDecision.style.color = 'var(--blue-accent)';
            outDesc.textContent = `Left IR sensor drifted off the line. Microcontroller applies differential PWM (M_Left: 210, M_Right: 120) to steer robot back toward center track.`;
        } else {
            outDecision.textContent = 'SEARCH_LINE (HUNTING TRACK)';
            outDecision.style.color = 'var(--warn-accent)';
            outDesc.textContent = `Both IR sensors are off the line while path is clear (${distance} cm). System executes inward angular sweep routine until line reflectance is reacquired.`;
        }
    }

    distSlider.addEventListener('input', evaluateFusion);

    irLeftBtn.addEventListener('click', () => {
        leftOn = !leftOn;
        irLeftBtn.classList.toggle('active', leftOn);
        irLeftBtn.textContent = leftOn ? 'ON LINE' : 'OFF LINE';
        evaluateFusion();
    });

    irRightBtn.addEventListener('click', () => {
        rightOn = !rightOn;
        irRightBtn.classList.toggle('active', rightOn);
        irRightBtn.textContent = rightOn ? 'ON LINE' : 'OFF LINE';
        evaluateFusion();
    });

    evaluateFusion();
}

/* ==========================================================================
   7. SIMULATION 2.0: AUTONOMOUS ARENA & DYNAMIC OBSTACLE SIMULATOR
   ========================================================================== */
function initArenaSimulator() {
    const canvas = document.getElementById('arena-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const scopeCanvas = document.getElementById('arena-pid-scope');
    const scopeCtx = scopeCanvas ? scopeCanvas.getContext('2d') : null;

    // Controls DOM
    const trackSelect = document.getElementById('arena-track-select');
    const btnModeAuto = document.getElementById('arena-mode-auto');
    const btnModeManual = document.getElementById('arena-mode-manual');
    const btnAddStatic = document.getElementById('arena-add-static-btn');
    const btnAddMoving = document.getElementById('arena-add-moving-btn');
    const btnClearObs = document.getElementById('arena-clear-obs-btn');
    const drawBar = document.getElementById('arena-draw-bar');
    const btnSmoothDraw = document.getElementById('arena-smooth-draw-btn');
    const btnClearDraw = document.getElementById('arena-clear-draw-btn');
    const btnApplyDraw = document.getElementById('arena-apply-draw-btn');

    const btnStart = document.getElementById('arena-btn-start');
    const btnPause = document.getElementById('arena-btn-pause');
    const btnReset = document.getElementById('arena-btn-reset');
    const overlay = document.getElementById('arena-canvas-overlay');
    const overlayMsg = document.getElementById('arena-overlay-msg');

    const beamButtons = document.querySelectorAll('.beam-btn');
    const chkTrails = document.getElementById('arena-chk-trails');
    const chkSonar = document.getElementById('arena-chk-sonar');
    const chkGrid = document.getElementById('arena-chk-grid');

    // Telemetry DOM
    const fsmBadge = document.getElementById('arena-fsm-badge');
    const statSpeed = document.getElementById('arena-stat-speed');
    const statCte = document.getElementById('arena-stat-cte');
    const statDist = document.getElementById('arena-stat-dist');
    const statSteer = document.getElementById('arena-stat-steer');
    const statLaps = document.getElementById('arena-stat-laps');
    const statAvoided = document.getElementById('arena-stat-avoided');
    const irL = document.getElementById('arena-ir-l');
    const irC = document.getElementById('arena-ir-c');
    const irR = document.getElementById('arena-ir-r');
    const scopeRms = document.getElementById('arena-scope-rms');
    const eventLog = document.getElementById('arena-event-log');
    const logClearBtn = document.getElementById('arena-log-clear');

    // PID Tuner Sliders
    const sliderKp = document.getElementById('slider-kp');
    const sliderKi = document.getElementById('slider-ki');
    const sliderKd = document.getElementById('slider-kd');
    const sliderSpeed = document.getElementById('slider-speed');
    const valKp = document.getElementById('val-kp');
    const valKi = document.getElementById('val-ki');
    const valKd = document.getElementById('val-kd');
    const valSpeed = document.getElementById('val-speed');
    const btnPidReset = document.getElementById('arena-pid-reset-btn');

    // Manual RC & D-Pad
    const rcAebChk = document.getElementById('arena-rc-aeb');
    const dpadFwd = document.getElementById('dpad-fwd');
    const dpadLeft = document.getElementById('dpad-left');
    const dpadStop = document.getElementById('dpad-stop');
    const dpadRight = document.getElementById('dpad-right');
    const dpadRev = document.getElementById('dpad-rev');

    // State Variables
    let isRunning = false;
    let isPaused = false;
    let controlMode = 'auto'; // 'auto' or 'manual'
    let beamCount = 3; // 1, 3, or 5
    let animId = null;

    // PID Gains & Parameters
    let Kp = 1.80;
    let Ki = 0.05;
    let Kd = 0.90;
    let maxBaseSpeed = 210;
    let integralError = 0;
    let prevCte = 0;

    // CTE Scope History (100 samples)
    const cteHistory = new Array(100).fill(0);

    // Obstacles List
    let obstacles = [];
    let draggedObstacle = null;
    let isDrawingTrack = false;
    let customTrackPoints = [];

    // Manual RC Key States
    const manualKeys = { forward: false, reverse: false, left: false, right: false, brake: false };

    // Stats
    let totalLaps = 0;
    let avoidedCount = 0;
    let hitCount = 0;
    let currentWaypointIdx = 0;

    // Particle Trail Buffer
    const particles = [];

    // Robot Arena Model
    const arenaRobot = {
        x: 180,
        y: 120,
        heading: 0, // radians
        speed: 0,
        targetSpeed: 2.2,
        angularVelocity: 0,
        steerAngle: 0, // degrees
        width: 28,
        length: 36,
        fsmState: 'LINE_FOLLOW',
        evadeTimer: 0,
        evadeDirection: 1, // 1 for right, -1 for left
        servoSweep: 0,
        servoSweepDir: 1,
        nearestDist: 999,
        irStatus: [false, true, false], // L, C, R
        cte: 0
    };

    // Built-in Track Presets Generators
    function generateTrack(type) {
        const pts = [];
        const w = canvas.width;
        const h = canvas.height;

        if (type === 'warehouse') {
            // Rounded rectangular circuit with rounded corners and inner return
            const rx = 100, ry = 80, rw = w - 200, rh = h - 160, r = 70;
            const segments = 160;
            for (let i = 0; i < segments; i++) {
                const t = (i / segments) * Math.PI * 2;
                // Superellipse rounded rectangle
                const cosT = Math.cos(t);
                const sinT = Math.sin(t);
                const n = 4; // squareness
                const sX = Math.sign(cosT) * Math.pow(Math.abs(cosT), 2 / n);
                const sY = Math.sign(sinT) * Math.pow(Math.abs(sinT), 2 / n);
                pts.push({
                    x: w / 2 + sX * (rw / 2),
                    y: h / 2 + sY * (rh / 2)
                });
            }
        } else if (type === 'figure8') {
            // Mathematical Bernoulli Lemniscate
            const a = (w - 200) / 2;
            const b = (h - 180) / 2;
            const segments = 180;
            for (let i = 0; i < segments; i++) {
                const t = (i / segments) * Math.PI * 2;
                const denom = 1 + Math.sin(t) * Math.sin(t);
                const x = (w / 2) + (a * Math.cos(t)) / denom;
                const y = (h / 2) + (b * Math.sin(t) * Math.cos(t) * 1.6) / denom;
                pts.push({ x, y });
            }
        } else if (type === 'slalom') {
            // Winding Multi-Apex Hairpin Circuit
            const segments = 180;
            for (let i = 0; i < segments; i++) {
                const t = (i / segments) * Math.PI * 2;
                const cx = w / 2;
                const cy = h / 2;
                const r = 160 + 55 * Math.sin(4 * t) + 25 * Math.cos(2 * t);
                const x = cx + Math.cos(t) * r * 1.5;
                const y = cy + Math.sin(t) * r;
                pts.push({ x, y });
            }
        } else if (type === 'custom') {
            if (customTrackPoints.length > 3) {
                return customTrackPoints;
            } else {
                // Fallback initial loop
                return generateTrack('warehouse');
            }
        }
        return pts;
    }

    let activeTrack = generateTrack('warehouse');

    // Obstacle Setup for Presets
    function initDefaultObstacles(trackType) {
        obstacles = [];
        if (trackType === 'warehouse') {
            obstacles.push({ id: 1, x: 430, y: 80, radius: 22, type: 'static', color: '#f59e0b', name: 'Cargo Crate A' });
            obstacles.push({ id: 2, x: 680, y: 260, radius: 20, type: 'static', color: '#f59e0b', name: 'Pallet B' });
            obstacles.push({ 
                id: 3, x: 280, y: 440, radius: 24, type: 'moving', vx: 1.2, vy: 0, 
                minX: 200, maxX: 640, minY: 440, maxY: 440, color: '#ef4444', name: 'Forklift AGV' 
            });
            obstacles.push({ 
                id: 4, x: 150, y: 260, radius: 18, type: 'moving', vx: 0, vy: 0.9, 
                minX: 150, maxX: 150, minY: 160, maxY: 360, color: '#ec4899', name: 'Inspection Bot' 
            });
        } else if (trackType === 'figure8') {
            obstacles.push({ id: 1, x: 260, y: 210, radius: 22, type: 'static', color: '#f59e0b', name: 'Pylon 1' });
            obstacles.push({ id: 2, x: 600, y: 310, radius: 22, type: 'static', color: '#f59e0b', name: 'Pylon 2' });
            obstacles.push({ 
                id: 3, x: 430, y: 160, radius: 20, type: 'moving', vx: 0, vy: 1.1, 
                minX: 430, maxX: 430, minY: 120, maxY: 400, color: '#ef4444', name: 'Intersection Drone' 
            });
        } else if (trackType === 'slalom') {
            obstacles.push({ id: 1, x: 320, y: 150, radius: 24, type: 'static', color: '#f59e0b', name: 'Slalom Gate 1' });
            obstacles.push({ id: 2, x: 540, y: 370, radius: 24, type: 'static', color: '#f59e0b', name: 'Slalom Gate 2' });
            obstacles.push({ id: 3, x: 430, y: 260, radius: 26, type: 'static', color: '#f59e0b', name: 'Center Hub' });
            obstacles.push({ 
                id: 4, x: 650, y: 190, radius: 20, type: 'moving', vx: -1.0, vy: 0.8, 
                minX: 520, maxX: 720, minY: 140, maxY: 380, color: '#ef4444', name: 'Roaming Hazard' 
            });
        } else {
            obstacles.push({ id: 1, x: 430, y: 260, radius: 24, type: 'static', color: '#f59e0b', name: 'Sandbox Obstacle' });
        }
    }

    initDefaultObstacles('warehouse');

    // Reset Arena to Initial State
    function resetArena() {
        isRunning = false;
        isPaused = false;
        if (animId) cancelAnimationFrame(animId);

        if (activeTrack.length > 0) {
            arenaRobot.x = activeTrack[0].x;
            arenaRobot.y = activeTrack[0].y;
            // Align heading toward next waypoint
            if (activeTrack.length > 1) {
                arenaRobot.heading = Math.atan2(activeTrack[1].y - activeTrack[0].y, activeTrack[1].x - activeTrack[0].x);
            } else {
                arenaRobot.heading = 0;
            }
        } else {
            arenaRobot.x = 180;
            arenaRobot.y = 120;
            arenaRobot.heading = 0;
        }

        arenaRobot.speed = 0;
        arenaRobot.angularVelocity = 0;
        arenaRobot.steerAngle = 0;
        arenaRobot.fsmState = 'LINE_FOLLOW';
        arenaRobot.evadeTimer = 0;
        arenaRobot.nearestDist = 999;
        arenaRobot.cte = 0;
        integralError = 0;
        prevCte = 0;
        currentWaypointIdx = 0;
        totalLaps = 0;
        avoidedCount = 0;
        hitCount = 0;
        particles.length = 0;
        cteHistory.fill(0);

        btnStart.disabled = false;
        btnPause.disabled = true;
        overlay.style.display = 'block';
        overlayMsg.textContent = 'ARENA READY - PRESS START';
        
        updateArenaTelemetry();
        renderArena();
        renderScope();
        addArenaLog('[SYSTEM] Arena reset. Robot positioned at Waypoint 0.');
    }

    // Telemetry Event Log
    function addArenaLog(msg) {
        if (!eventLog) return;
        const line = document.createElement('div');
        line.className = 'log-line';
        if (msg.includes('AVOID') || msg.includes('EVADE')) line.classList.add('text-warn');
        else if (msg.includes('AEB') || msg.includes('COLLISION')) line.classList.add('text-danger');
        else if (msg.includes('LAP') || msg.includes('SUCCESS')) line.classList.add('text-emerald');
        else line.classList.add('text-cyan');

        const now = new Date();
        const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
        line.textContent = `[${timeStr}] ${msg}`;
        eventLog.appendChild(line);
        eventLog.scrollTop = eventLog.scrollHeight;
    }

    if (logClearBtn) {
        logClearBtn.addEventListener('click', () => {
            eventLog.innerHTML = '<div class="log-line text-cyan">[INIT] Arena Log cleared. Ready.</div>';
        });
    }

    // Sonar Raycasting Engine
    function castRay(originX, originY, angleRad, maxRange = 280) {
        const dx = Math.cos(angleRad);
        const dy = Math.sin(angleRad);
        let closestDist = maxRange;
        let hitPoint = { x: originX + dx * maxRange, y: originY + dy * maxRange };
        let hitObject = null;

        // Check against all active obstacles
        obstacles.forEach(obs => {
            const ox = obs.x - originX;
            const oy = obs.y - originY;
            const proj = ox * dx + oy * dy;

            if (proj > 0 && proj < closestDist + obs.radius) {
                const perpSq = (ox - proj * dx) ** 2 + (oy - proj * dy) ** 2;
                if (perpSq <= obs.radius * obs.radius) {
                    const dHit = proj - Math.sqrt(obs.radius * obs.radius - perpSq);
                    if (dHit > 0 && dHit < closestDist) {
                        closestDist = dHit;
                        hitPoint = { x: originX + dx * dHit, y: originY + dy * dHit };
                        hitObject = obs;
                    }
                }
            }
        });

        // Check Arena Walls (Border Margin 15px)
        const walls = [
            { x1: 15, y1: 15, x2: canvas.width - 15, y2: 15 }, // Top
            { x1: canvas.width - 15, y1: 15, x2: canvas.width - 15, y2: canvas.height - 15 }, // Right
            { x1: canvas.width - 15, y1: canvas.height - 15, x2: 15, y2: canvas.height - 15 }, // Bottom
            { x1: 15, y1: canvas.height - 15, x2: 15, y2: 15 } // Left
        ];

        walls.forEach(w => {
            const denom = (w.x1 - w.x2) * dy - (w.y1 - w.y2) * dx;
            if (Math.abs(denom) > 0.0001) {
                const t = ((w.x1 - originX) * (w.y1 - w.y2) - (w.y1 - originY) * (w.x1 - w.x2)) / denom;
                const u = -((w.x1 - originX) * dy - (w.y1 - originY) * dx) / denom;
                if (t > 0 && t < closestDist && u >= 0 && u <= 1) {
                    closestDist = t;
                    hitPoint = { x: originX + dx * t, y: originY + dy * t };
                    hitObject = { name: 'Arena Perimeter Wall' };
                }
            }
        });

        return { distance: closestDist, hitPoint, hitObject, angle: angleRad };
    }

    // Get Active Sonar Ray Angles
    function getSonarRays() {
        const rays = [];
        const h = arenaRobot.heading;
        const frontX = arenaRobot.x + Math.cos(h) * 20;
        const frontY = arenaRobot.y + Math.sin(h) * 20;

        if (beamCount === 1) {
            // Sweeping Servo (±45°)
            arenaRobot.servoSweep += 0.05 * arenaRobot.servoSweepDir;
            if (arenaRobot.servoSweep > 0.75) arenaRobot.servoSweepDir = -1;
            if (arenaRobot.servoSweep < -0.75) arenaRobot.servoSweepDir = 1;
            rays.push(castRay(frontX, frontY, h + arenaRobot.servoSweep));
        } else if (beamCount === 3) {
            // 3-Beam Fan (-30°, 0°, +30°)
            rays.push(castRay(frontX, frontY, h - 0.52));
            rays.push(castRay(frontX, frontY, h));
            rays.push(castRay(frontX, frontY, h + 0.52));
        } else if (beamCount === 5) {
            // 5-Beam LiDAR Fan (-60°, -30°, 0°, +30°, +60°)
            const angles = [-1.05, -0.52, 0, 0.52, 1.05];
            angles.forEach(a => rays.push(castRay(frontX, frontY, h + a)));
        }

        return rays;
    }

    // Find Cross-Track Error & Closest Waypoint
    function computeTrackingError() {
        if (!activeTrack || activeTrack.length < 2) return { cte: 0, targetHeading: arenaRobot.heading };

        let minD = Infinity;
        let bestIdx = 0;

        // Search closest segment
        for (let i = 0; i < activeTrack.length; i++) {
            const p = activeTrack[i];
            const d = (p.x - arenaRobot.x) ** 2 + (p.y - arenaRobot.y) ** 2;
            if (d < minD) {
                minD = d;
                bestIdx = i;
            }
        }

        currentWaypointIdx = bestIdx;

        // Lookahead point for smooth pursuit (5 waypoints ahead)
        const lookaheadIdx = (bestIdx + 6) % activeTrack.length;
        const targetPt = activeTrack[lookaheadIdx];
        const prevPt = activeTrack[(bestIdx + activeTrack.length - 1) % activeTrack.length];
        const nextPt = activeTrack[(bestIdx + 1) % activeTrack.length];

        // Track tangent vector
        const tx = nextPt.x - prevPt.x;
        const ty = nextPt.y - prevPt.y;
        const tLen = Math.hypot(tx, ty) || 1;
        const normTx = tx / tLen;
        const normTy = ty / tLen;

        // Vector from robot to closest point
        const rx = arenaRobot.x - activeTrack[bestIdx].x;
        const ry = arenaRobot.y - activeTrack[bestIdx].y;

        // Signed Cross-Track Error (Cross product of tangent & error)
        const cte = (rx * normTy - ry * normTx);

        // Target Heading toward lookahead point
        const targetHeading = Math.atan2(targetPt.y - arenaRobot.y, targetPt.x - arenaRobot.x);

        // Check Lap Completion
        if (bestIdx === 0 && arenaRobot.fsmState === 'LINE_FOLLOW' && Math.sqrt(minD) < 30) {
            if (!arenaRobot.lapFlag) {
                totalLaps++;
                arenaRobot.lapFlag = true;
                addArenaLog(`[LAP SUCCESS] Lap ${totalLaps} completed!`);
            }
        } else if (bestIdx > 10) {
            arenaRobot.lapFlag = false;
        }

        return { cte, targetHeading };
    }

    // Update Optical 3-Channel Sensor Status
    function updateOpticalSensors(cte) {
        // Track width is ~24px. Optical array spans 20px
        const onCenter = Math.abs(cte) < 10;
        const onLeft = cte < -6;
        const onRight = cte > 6;

        arenaRobot.irStatus = [onLeft, onCenter, onRight];

        if (irL) irL.classList.toggle('active', onLeft);
        if (irC) irC.classList.toggle('active', onCenter);
        if (irR) irR.classList.toggle('active', onRight);
    }

    // Update Moving Dynamic Obstacles
    function updateDynamicObstacles() {
        obstacles.forEach(obs => {
            if (obs.type === 'moving') {
                obs.x += obs.vx;
                obs.y += obs.vy;

                // Bounce off designated patrol bounds
                if (obs.x <= obs.minX || obs.x >= obs.maxX) obs.vx *= -1;
                if (obs.y <= obs.minY || obs.y >= obs.maxY) obs.vy *= -1;

                // Screen bounds safety
                if (obs.x < 30 || obs.x > canvas.width - 30) obs.vx *= -1;
                if (obs.y < 30 || obs.y > canvas.height - 30) obs.vy *= -1;
            }
        });
    }

    // Update Physics & Control Logic
    function updateArenaPhysics() {
        updateDynamicObstacles();

        const rays = getSonarRays();
        let minRayDist = Infinity;
        let closestObstacle = null;
        let criticalAngle = 0;

        rays.forEach(r => {
            if (r.distance < minRayDist) {
                minRayDist = r.distance;
                closestObstacle = r.hitObject;
                criticalAngle = r.angle;
            }
        });

        arenaRobot.nearestDist = Math.round(minRayDist);

        if (controlMode === 'auto') {
            // AUTONOMOUS FSM + PID CONTROLLER
            const { cte, targetHeading } = computeTrackingError();
            arenaRobot.cte = cte;
            updateOpticalSensors(cte);

            // Update PID CTE buffer
            cteHistory.push(cte);
            if (cteHistory.length > 100) cteHistory.shift();

            // Safety Thresholds
            const CRITICAL_STOP_DIST = 38;
            const EVADE_TRIGGER_DIST = 75;

            if (minRayDist < CRITICAL_STOP_DIST) {
                // Emergency Halt & Dynamic Scan
                arenaRobot.fsmState = 'OBSTACLE_HALT';
                arenaRobot.speed *= 0.6; // Active brake
                if (arenaRobot.speed < 0.1) arenaRobot.speed = 0;

                // Decide evade direction away from critical obstacle ray
                const angleDiff = criticalAngle - arenaRobot.heading;
                arenaRobot.evadeDirection = angleDiff > 0 ? -1 : 1;
                arenaRobot.evadeTimer = 45;
                fsmBadge.textContent = 'OBSTACLE_STOP';
                fsmBadge.className = 'badge badge-pulse bg-danger';
            } else if (minRayDist < EVADE_TRIGGER_DIST || arenaRobot.evadeTimer > 0) {
                // Evasive Tangential Bypass Arc
                arenaRobot.fsmState = 'AVOID_EVADE';
                fsmBadge.textContent = 'AVOID_BYPASS';
                fsmBadge.className = 'badge badge-pulse bg-warn';

                // Steer aggressively away from obstacle while crawling forward
                const targetSteer = arenaRobot.evadeDirection * 0.9;
                arenaRobot.heading += targetSteer * 0.045;
                arenaRobot.speed = 1.4;

                if (arenaRobot.evadeTimer > 0) arenaRobot.evadeTimer--;
                if (minRayDist > EVADE_TRIGGER_DIST && arenaRobot.evadeTimer <= 0) {
                    avoidedCount++;
                    addArenaLog(`[EVASION] Obstacle bypassed successfully! Re-tracking.`);
                    arenaRobot.fsmState = 'LINE_FOLLOW';
                }
            } else {
                // Closed-Loop PID Line Following
                arenaRobot.fsmState = 'LINE_FOLLOW';
                fsmBadge.textContent = 'LINE_FOLLOW (PID)';
                fsmBadge.className = 'badge badge-pulse';

                // PID Math
                integralError += cte * 0.016;
                integralError = Math.max(-50, Math.min(50, integralError)); // Anti-windup
                const derivativeError = (cte - prevCte) / 0.016;
                prevCte = cte;

                const pidOutput = (Kp * cte * 0.04) + (Ki * integralError * 0.01) + (Kd * derivativeError * 0.002);

                // Angular Heading Blend
                let headingDiff = targetHeading - arenaRobot.heading;
                while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
                while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;

                const steerCorrection = headingDiff * 0.06 - pidOutput * 0.03;
                arenaRobot.heading += Math.max(-0.12, Math.min(0.12, steerCorrection));

                // Speed calculation based on curvature
                const curvature = Math.abs(steerCorrection);
                const targetV = Math.max(1.2, (maxBaseSpeed / 90) * (1 - curvature * 3));
                arenaRobot.speed += (targetV - arenaRobot.speed) * 0.1;
            }
        } else {
            // MANUAL TELEOPERATION RC MODE
            fsmBadge.textContent = 'MANUAL RC (TELE-OP)';
            fsmBadge.className = 'badge badge-pulse bg-cyan';

            let throttle = 0;
            let steer = 0;

            if (manualKeys.forward) throttle += 1;
            if (manualKeys.reverse) throttle -= 0.6;
            if (manualKeys.left) steer -= 1;
            if (manualKeys.right) steer += 1;
            if (manualKeys.brake) throttle = 0;

            // Autonomous Emergency Braking (AEB)
            const aebEnabled = rcAebChk ? rcAebChk.checked : true;
            if (aebEnabled && throttle > 0 && minRayDist < 42) {
                throttle = 0;
                arenaRobot.speed *= 0.4;
                fsmBadge.textContent = 'AEB EMERGENCY STOP';
                fsmBadge.className = 'badge badge-pulse bg-danger';
                addArenaLog(`[AEB TRIGGERED] Proximity alert (${minRayDist} cm). Brake engaged!`);
            }

            // Apply steering & velocity
            arenaRobot.heading += steer * 0.045;
            const targetManualSpeed = throttle * (maxBaseSpeed / 80);
            arenaRobot.speed += (targetManualSpeed - arenaRobot.speed) * 0.15;
            if (manualKeys.brake) arenaRobot.speed *= 0.7;

            // Compute CTE passively for HUD display
            const { cte } = computeTrackingError();
            arenaRobot.cte = cte;
            updateOpticalSensors(cte);
            cteHistory.push(cte);
            if (cteHistory.length > 100) cteHistory.shift();
        }

        // Advance Robot Kinematics
        arenaRobot.x += Math.cos(arenaRobot.heading) * arenaRobot.speed;
        arenaRobot.y += Math.sin(arenaRobot.heading) * arenaRobot.speed;

        // Keep inside arena boundaries
        arenaRobot.x = Math.max(25, Math.min(canvas.width - 25, arenaRobot.x));
        arenaRobot.y = Math.max(25, Math.min(canvas.height - 25, arenaRobot.y));

        // Particle Tire Trails
        if (chkTrails && chkTrails.checked && arenaRobot.speed > 0.4) {
            if (Math.random() < 0.4) {
                const backX = arenaRobot.x - Math.cos(arenaRobot.heading) * 16;
                const backY = arenaRobot.y - Math.sin(arenaRobot.heading) * 16;
                particles.push({
                    x: backX + (Math.random() - 0.5) * 8,
                    y: backY + (Math.random() - 0.5) * 8,
                    alpha: 0.6,
                    radius: Math.random() * 2 + 1.5
                });
            }
        }

        // Fade particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].alpha -= 0.015;
            if (particles[i].alpha <= 0) particles.splice(i, 1);
        }

        // Obstacle Collision Check
        obstacles.forEach(obs => {
            const dist = Math.hypot(arenaRobot.x - obs.x, arenaRobot.y - obs.y);
            if (dist < obs.radius + 14) {
                hitCount++;
                // Push back to prevent phasing
                const angle = Math.atan2(arenaRobot.y - obs.y, arenaRobot.x - obs.x);
                arenaRobot.x = obs.x + Math.cos(angle) * (obs.radius + 15);
                arenaRobot.y = obs.y + Math.sin(angle) * (obs.radius + 15);
                arenaRobot.speed = 0;
                addArenaLog(`[COLLISION] Contact with ${obs.name || 'Obstacle'}!`);
            }
        });
    }

    // Render Canvas Arena Graphics
    function renderArena() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Arena Grid Layer
        if (chkGrid && chkGrid.checked) {
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
            ctx.lineWidth = 1;
            const step = 40;
            for (let x = 0; x <= canvas.width; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= canvas.height; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Arena Perimeter Border
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.lineWidth = 2;
            ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        }

        // 2. Navigation Track Line
        if (activeTrack && activeTrack.length > 1) {
            // Track outer glow / border
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
            ctx.lineWidth = 26;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(activeTrack[0].x, activeTrack[0].y);
            for (let i = 1; i < activeTrack.length; i++) {
                ctx.lineTo(activeTrack[i].x, activeTrack[i].y);
            }
            if (activeTrack.length > 10) ctx.closePath();
            ctx.stroke();

            // Track main black center tape
            ctx.strokeStyle = '#050a14';
            ctx.lineWidth = 16;
            ctx.stroke();

            // Track centerline dashed guidance
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 3. Tire Trails
        particles.forEach(p => {
            ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // 4. Sonar Raycasting Visualizer
        const rays = getSonarRays();
        if (chkSonar && chkSonar.checked) {
            const h = arenaRobot.heading;
            const frontX = arenaRobot.x + Math.cos(h) * 18;
            const frontY = arenaRobot.y + Math.sin(h) * 18;

            rays.forEach(r => {
                // Ray line
                const isClose = r.distance < 45;
                const isCrit = r.distance < 25;
                const rayColor = isCrit ? '#ef4444' : (isClose ? '#f59e0b' : 'rgba(0, 240, 255, 0.6)');

                ctx.strokeStyle = rayColor;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(frontX, frontY);
                ctx.lineTo(r.hitPoint.x, r.hitPoint.y);
                ctx.stroke();

                // Hit ping blip
                ctx.fillStyle = rayColor;
                ctx.shadowColor = rayColor;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(r.hitPoint.x, r.hitPoint.y, isClose ? 5 : 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
        }

        // 5. Obstacles
        obstacles.forEach(obs => {
            ctx.save();
            ctx.translate(obs.x, obs.y);

            // Proximity Warning Ring
            const dToRobot = Math.hypot(arenaRobot.x - obs.x, arenaRobot.y - obs.y);
            if (dToRobot < obs.radius + 65) {
                const warnAlpha = Math.max(0.1, 1 - (dToRobot / (obs.radius + 65)));
                ctx.strokeStyle = `rgba(239, 68, 68, ${warnAlpha})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(0, 0, obs.radius + 12, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Patrol Direction Indicator for Moving Bots
            if (obs.type === 'moving') {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.moveTo(obs.minX - obs.x, obs.minY - obs.y);
                ctx.lineTo(obs.maxX - obs.x, obs.maxY - obs.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Obstacle Base
            const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, obs.radius);
            grad.addColorStop(0, obs.color || '#f59e0b');
            grad.addColorStop(1, '#78350f');

            ctx.fillStyle = grad;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Obstacle Details (Hazard Stripes / Icon)
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(0, 0, obs.radius * 0.45, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#e2e8f0';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(obs.name ? obs.name.split(' ')[0] : 'OBS', 0, obs.radius + 14);

            ctx.restore();
        });

        // 6. Draw Robot
        ctx.save();
        ctx.translate(arenaRobot.x, arenaRobot.y);
        ctx.rotate(arenaRobot.heading);

        // Robot Chassis Shadow
        ctx.shadowColor = 'rgba(0, 240, 255, 0.35)';
        ctx.shadowBlur = 14;

        // Drive Wheels (Left & Right)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        // Left wheel
        ctx.fillRect(-12, -18, 16, 6);
        ctx.strokeRect(-12, -18, 16, 6);
        // Right wheel
        ctx.fillRect(-12, 12, 16, 6);
        ctx.strokeRect(-12, 12, 16, 6);

        // Main Acrylic Chassis Body
        const bodyGrad = ctx.createLinearGradient(-18, -14, 20, 14);
        bodyGrad.addColorStop(0, '#0e1a30');
        bodyGrad.addColorStop(1, '#1b2c4e');
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-18, -14, 36, 28, 6);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Microcontroller Board / Circuit Details
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-8, -8, 16, 16);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1;
        ctx.strokeRect(-8, -8, 16, 16);

        // HC-SR04 Sonar Transducers at front
        ctx.fillStyle = '#94a3b8';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        // Left transducer
        ctx.beginPath();
        ctx.arc(16, -6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Right transducer
        ctx.beginPath();
        ctx.arc(16, 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3-Channel Optical Sensor Floor Spots
        const irColors = arenaRobot.irStatus;
        // Left IR
        ctx.fillStyle = irColors[0] ? '#10b981' : 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(12, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Center IR
        ctx.fillStyle = irColors[1] ? '#10b981' : 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(12, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Right IR
        ctx.fillStyle = irColors[2] ? '#10b981' : 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(12, 10, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Front Direction Indicator Arrow
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(24, 0);
        ctx.lineTo(20, -4);
        ctx.moveTo(24, 0);
        ctx.lineTo(20, 4);
        ctx.stroke();

        ctx.restore();
    }

    // Render Real-Time PID Cross-Track Error Oscilloscope
    function renderScope() {
        if (!scopeCtx || !scopeCanvas) return;
        const w = scopeCanvas.width;
        const h = scopeCanvas.height;

        scopeCtx.clearRect(0, 0, w, h);

        // Background & Grid
        scopeCtx.fillStyle = '#030712';
        scopeCtx.fillRect(0, 0, w, h);

        scopeCtx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        scopeCtx.lineWidth = 1;
        for (let x = 0; x <= w; x += 30) {
            scopeCtx.beginPath();
            scopeCtx.moveTo(x, 0);
            scopeCtx.lineTo(x, h);
            scopeCtx.stroke();
        }
        for (let y = 0; y <= h; y += 20) {
            scopeCtx.beginPath();
            scopeCtx.moveTo(0, y);
            scopeCtx.lineTo(w, y);
            scopeCtx.stroke();
        }

        // Center Baseline (0 mm error)
        const midY = h / 2;
        scopeCtx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        scopeCtx.lineWidth = 1;
        scopeCtx.setLineDash([4, 4]);
        scopeCtx.beginPath();
        scopeCtx.moveTo(0, midY);
        scopeCtx.lineTo(w, midY);
        scopeCtx.stroke();
        scopeCtx.setLineDash([]);

        // Plot Waveform
        if (cteHistory.length > 1) {
            scopeCtx.strokeStyle = '#10b981';
            scopeCtx.lineWidth = 2;
            scopeCtx.shadowColor = '#10b981';
            scopeCtx.shadowBlur = 8;
            scopeCtx.beginPath();

            const step = w / (cteHistory.length - 1);
            const scaleY = 1.2; // mm to pixel scale

            for (let i = 0; i < cteHistory.length; i++) {
                const x = i * step;
                const y = midY - (cteHistory[i] * scaleY);
                if (i === 0) scopeCtx.moveTo(x, y);
                else scopeCtx.lineTo(x, y);
            }
            scopeCtx.stroke();
            scopeCtx.shadowBlur = 0;
        }

        // Compute RMS Error
        let sumSq = 0;
        cteHistory.forEach(v => sumSq += v * v);
        const rms = Math.sqrt(sumSq / cteHistory.length);
        if (scopeRms) scopeRms.textContent = `RMS: ${rms.toFixed(2)} mm`;
    }

    // Telemetry Panel Update
    function updateArenaTelemetry() {
        if (statSpeed) statSpeed.textContent = (arenaRobot.speed * 18.5).toFixed(1);
        if (statCte) statCte.textContent = (arenaRobot.cte * 1.5).toFixed(1);
        if (statDist) statDist.textContent = arenaRobot.nearestDist < 250 ? arenaRobot.nearestDist : '> 250';
        if (statSteer) statSteer.textContent = `${Math.round((arenaRobot.heading * 180) / Math.PI) % 360}°`;
        if (statLaps) statLaps.textContent = totalLaps;
        if (statAvoided) statAvoided.textContent = avoidedCount;
    }

    // Master Animation Loop
    function arenaLoop() {
        if (!isRunning || isPaused) return;
        updateArenaPhysics();
        renderArena();
        renderScope();
        updateArenaTelemetry();
        animId = requestAnimationFrame(arenaLoop);
    }

    // Interactive Drag & Drop / Drawing Handlers
    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        const pt = getCanvasCoords(e);

        // Check if clicked an obstacle
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            if (Math.hypot(pt.x - obs.x, pt.y - obs.y) <= obs.radius + 6) {
                draggedObstacle = obs;
                canvas.style.cursor = 'grabbing';
                return;
            }
        }

        // If in custom track draw mode
        if (isDrawingTrack) {
            customTrackPoints.push(pt);
            activeTrack = customTrackPoints;
            renderArena();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const pt = getCanvasCoords(e);

        if (draggedObstacle) {
            draggedObstacle.x = Math.max(30, Math.min(canvas.width - 30, pt.x));
            draggedObstacle.y = Math.max(30, Math.min(canvas.height - 30, pt.y));
            if (draggedObstacle.type === 'moving') {
                draggedObstacle.minX = draggedObstacle.x - 80;
                draggedObstacle.maxX = draggedObstacle.x + 80;
                draggedObstacle.minY = draggedObstacle.y - 60;
                draggedObstacle.maxY = draggedObstacle.y + 60;
            }
            if (!isRunning) renderArena();
        } else if (isDrawingTrack && e.buttons === 1) {
            const last = customTrackPoints[customTrackPoints.length - 1];
            if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 12) {
                customTrackPoints.push(pt);
                activeTrack = customTrackPoints;
                renderArena();
            }
        } else {
            // Hover check
            let hovering = false;
            obstacles.forEach(obs => {
                if (Math.hypot(pt.x - obs.x, pt.y - obs.y) <= obs.radius + 6) hovering = true;
            });
            canvas.style.cursor = hovering ? 'grab' : (isDrawingTrack ? 'crosshair' : 'default');
        }
    });

    window.addEventListener('mouseup', () => {
        if (draggedObstacle) {
            addArenaLog(`[OBSTACLE] Positioned "${draggedObstacle.name || 'Obstacle'}" at (${Math.round(draggedObstacle.x)}, ${Math.round(draggedObstacle.y)})`);
            draggedObstacle = null;
        }
    });

    // Touch Support for Mobile
    canvas.addEventListener('touchstart', (e) => {
        const pt = getCanvasCoords(e);
        obstacles.forEach(obs => {
            if (Math.hypot(pt.x - obs.x, pt.y - obs.y) <= obs.radius + 14) {
                draggedObstacle = obs;
            }
        });
        if (isDrawingTrack && !draggedObstacle) {
            customTrackPoints.push(pt);
            activeTrack = customTrackPoints;
            renderArena();
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        const pt = getCanvasCoords(e);
        if (draggedObstacle) {
            draggedObstacle.x = Math.max(30, Math.min(canvas.width - 30, pt.x));
            draggedObstacle.y = Math.max(30, Math.min(canvas.height - 30, pt.y));
            if (!isRunning) renderArena();
        } else if (isDrawingTrack) {
            customTrackPoints.push(pt);
            activeTrack = customTrackPoints;
            renderArena();
        }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
        draggedObstacle = null;
    });

    // Keyboard Event Listener for Manual RC
    window.addEventListener('keydown', (e) => {
        if (controlMode !== 'manual') return;
        if (['ArrowUp', 'KeyW'].includes(e.code)) { manualKeys.forward = true; dpadFwd?.classList.add('pressed'); e.preventDefault(); }
        if (['ArrowDown', 'KeyS'].includes(e.code)) { manualKeys.reverse = true; dpadRev?.classList.add('pressed'); e.preventDefault(); }
        if (['ArrowLeft', 'KeyA'].includes(e.code)) { manualKeys.left = true; dpadLeft?.classList.add('pressed'); e.preventDefault(); }
        if (['ArrowRight', 'KeyD'].includes(e.code)) { manualKeys.right = true; dpadRight?.classList.add('pressed'); e.preventDefault(); }
        if (e.code === 'Space') { manualKeys.brake = true; dpadStop?.classList.add('pressed'); e.preventDefault(); }
    });

    window.addEventListener('keyup', (e) => {
        if (['ArrowUp', 'KeyW'].includes(e.code)) { manualKeys.forward = false; dpadFwd?.classList.remove('pressed'); }
        if (['ArrowDown', 'KeyS'].includes(e.code)) { manualKeys.reverse = false; dpadRev?.classList.remove('pressed'); }
        if (['ArrowLeft', 'KeyA'].includes(e.code)) { manualKeys.left = false; dpadLeft?.classList.remove('pressed'); }
        if (['ArrowRight', 'KeyD'].includes(e.code)) { manualKeys.right = false; dpadRight?.classList.remove('pressed'); }
        if (e.code === 'Space') { manualKeys.brake = false; dpadStop?.classList.remove('pressed'); }
    });

    // D-Pad Button Pointer Events
    function bindDpad(btn, keyProp) {
        if (!btn) return;
        const press = (e) => { e.preventDefault(); manualKeys[keyProp] = true; btn.classList.add('pressed'); };
        const release = (e) => { e.preventDefault(); manualKeys[keyProp] = false; btn.classList.remove('pressed'); };
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
    }

    bindDpad(dpadFwd, 'forward');
    bindDpad(dpadRev, 'reverse');
    bindDpad(dpadLeft, 'left');
    bindDpad(dpadRight, 'right');
    bindDpad(dpadStop, 'brake');

    // Controls Event Listeners
    btnStart.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            isPaused = false;
            btnStart.disabled = true;
            btnPause.disabled = false;
            overlay.style.display = 'none';
            addArenaLog('[COMMAND] Arena simulation STARTED.');
            arenaLoop();
        } else if (isPaused) {
            isPaused = false;
            btnStart.disabled = true;
            btnPause.disabled = false;
            overlay.style.display = 'none';
            addArenaLog('[COMMAND] Arena simulation RESUMED.');
            arenaLoop();
        }
    });

    btnPause.addEventListener('click', () => {
        if (isRunning && !isPaused) {
            isPaused = true;
            btnStart.disabled = false;
            btnPause.disabled = true;
            overlay.style.display = 'block';
            overlayMsg.textContent = 'ARENA SIMULATION PAUSED';
            addArenaLog('[COMMAND] Arena simulation PAUSED.');
        }
    });

    btnReset.addEventListener('click', resetArena);

    // Track Selection
    trackSelect.addEventListener('change', () => {
        const val = trackSelect.value;
        if (val === 'custom') {
            isDrawingTrack = true;
            if (drawBar) drawBar.style.display = 'flex';
            customTrackPoints = [];
            activeTrack = [];
            addArenaLog('[MODE] Custom track drawing mode enabled. Click & drag to sketch.');
        } else {
            isDrawingTrack = false;
            if (drawBar) drawBar.style.display = 'none';
            activeTrack = generateTrack(val);
            initDefaultObstacles(val);
            addArenaLog(`[TRACK] Loaded circuit: ${val.toUpperCase()}`);
        }
        resetArena();
    });

    // Custom Path Action Bar Buttons
    if (btnSmoothDraw) {
        btnSmoothDraw.addEventListener('click', () => {
            if (customTrackPoints.length < 5) return;
            // Moving average smoothing
            const smoothed = [];
            for (let i = 0; i < customTrackPoints.length; i++) {
                const p0 = customTrackPoints[(i + customTrackPoints.length - 1) % customTrackPoints.length];
                const p1 = customTrackPoints[i];
                const p2 = customTrackPoints[(i + 1) % customTrackPoints.length];
                smoothed.push({
                    x: (p0.x + p1.x + p2.x) / 3,
                    y: (p0.y + p1.y + p2.y) / 3
                });
            }
            customTrackPoints = smoothed;
            activeTrack = smoothed;
            renderArena();
            addArenaLog('[CUSTOM TRACK] Applied Gaussian smoothing filter.');
        });
    }

    if (btnClearDraw) {
        btnClearDraw.addEventListener('click', () => {
            customTrackPoints = [];
            activeTrack = [];
            renderArena();
            addArenaLog('[CUSTOM TRACK] Cleared path canvas.');
        });
    }

    if (btnApplyDraw) {
        btnApplyDraw.addEventListener('click', () => {
            if (customTrackPoints.length > 4) {
                isDrawingTrack = false;
                resetArena();
                addArenaLog('[CUSTOM TRACK] Path compiled and deployed to robot memory.');
            }
        });
    }

    // Mode Toggle (Auto vs Manual)
    btnModeAuto.addEventListener('click', () => {
        controlMode = 'auto';
        btnModeAuto.classList.add('active');
        btnModeManual.classList.remove('active');
        addArenaLog('[MODE] Switched to Autonomous FSM & PID Control.');
    });

    btnModeManual.addEventListener('click', () => {
        controlMode = 'manual';
        btnModeManual.classList.add('active');
        btnModeAuto.classList.remove('active');
        addArenaLog('[MODE] Switched to Manual RC Teleoperation.');
    });

    // Obstacle Tool Actions
    btnAddStatic.addEventListener('click', () => {
        const id = obstacles.length + 1;
        const newObs = {
            id,
            x: 200 + Math.random() * (canvas.width - 400),
            y: 150 + Math.random() * (canvas.height - 300),
            radius: 20 + Math.random() * 8,
            type: 'static',
            color: '#f59e0b',
            name: `Barrel #${id}`
        };
        obstacles.push(newObs);
        renderArena();
        addArenaLog(`[SPAWN] Added static obstacle at (${Math.round(newObs.x)}, ${Math.round(newObs.y)})`);
    });

    btnAddMoving.addEventListener('click', () => {
        const id = obstacles.length + 1;
        const startX = 250 + Math.random() * 300;
        const startY = 180 + Math.random() * 200;
        const newObs = {
            id,
            x: startX,
            y: startY,
            radius: 20,
            type: 'moving',
            vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6),
            vy: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.6),
            minX: startX - 120,
            maxX: startX + 120,
            minY: startY - 80,
            maxY: startY + 80,
            color: '#ef4444',
            name: `Patrol Bot #${id}`
        };
        obstacles.push(newObs);
        renderArena();
        addArenaLog(`[SPAWN] Added dynamic moving patrol bot.`);
    });

    btnClearObs.addEventListener('click', () => {
        obstacles = [];
        renderArena();
        addArenaLog(`[OBSTACLES] Cleared all obstacles from arena.`);
    });

    // Sonar Beam Mode Selector
    beamButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            beamButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            beamCount = parseInt(btn.getAttribute('data-beam'));
            addArenaLog(`[SONAR] Transducer beam array configured to ${beamCount}-Beam mode.`);
        });
    });

    // PID Sliders Bindings
    function updatePidValues() {
        Kp = parseFloat(sliderKp.value);
        Ki = parseFloat(sliderKi.value);
        Kd = parseFloat(sliderKd.value);
        maxBaseSpeed = parseInt(sliderSpeed.value);

        if (valKp) valKp.textContent = Kp.toFixed(2);
        if (valKi) valKi.textContent = Ki.toFixed(2);
        if (valKd) valKd.textContent = Kd.toFixed(2);
        if (valSpeed) valSpeed.textContent = maxBaseSpeed;
    }

    [sliderKp, sliderKi, sliderKd, sliderSpeed].forEach(s => {
        if (s) s.addEventListener('input', updatePidValues);
    });

    if (btnPidReset) {
        btnPidReset.addEventListener('click', () => {
            sliderKp.value = 1.80;
            sliderKi.value = 0.05;
            sliderKd.value = 0.90;
            sliderSpeed.value = 210;
            updatePidValues();
            addArenaLog('[PID] Reset gains to factory tuned baseline.');
        });
    }

    // Redraw on layer toggle
    [chkTrails, chkSonar, chkGrid].forEach(chk => {
        if (chk) chk.addEventListener('change', () => { if (!isRunning) renderArena(); });
    });

    // Initial Setup
    updatePidValues();
    resetArena();
}

