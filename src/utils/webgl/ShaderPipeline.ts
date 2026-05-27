// ============================================================================
// SHADER PIPELINE
// Phase 2 Foundation: Multi-pass WebGL rendering with ping-pong FBOs
// ============================================================================

import type { ShaderProgram, ShaderPass, UniformValue } from '../../types';

export class ShaderPipeline {
  private gl: WebGL2RenderingContext;
  private passes: ShaderPass[] = [];
  private framebuffers: WebGLFramebuffer[] = [];
  private textures: WebGLTexture[] = [];
  private currentFBOIndex = 0;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = gl;
    this.initializeFBOs();
  }

  /**
   * Initialize ping-pong framebuffers for multi-pass rendering
   */
  private initializeFBOs(): void {
    const { gl } = this;
    const width = gl.canvas.width;
    const height = gl.canvas.height;

    // Create 2 FBOs for ping-pong rendering
    for (let i = 0; i < 2; i++) {
      const framebuffer = gl.createFramebuffer();
      const texture = gl.createTexture();

      if (!framebuffer || !texture) {
        throw new Error('Failed to create framebuffer or texture');
      }

      // Setup texture
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // Attach texture to framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );

      // Check framebuffer status
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error(`Framebuffer incomplete: ${status}`);
      }

      this.framebuffers.push(framebuffer);
      this.textures.push(texture);
    }

    // Unbind
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Add a shader pass to the pipeline
   */
  addPass(shader: ShaderProgram, index?: number): void {
    const pass: ShaderPass = {
      shader,
      enabled: true,
      uniforms: { ...shader.defaultUniforms },
      renderTarget: null
    };

    if (index !== undefined) {
      this.passes.splice(index, 0, pass);
    } else {
      this.passes.push(pass);
    }
  }

  /**
   * Remove a shader pass from the pipeline
   */
  removePass(index: number): void {
    if (index >= 0 && index < this.passes.length) {
      this.passes.splice(index, 1);
    }
  }

  /**
   * Reorder a shader pass
   */
  reorderPass(fromIndex: number, toIndex: number): void {
    if (
    fromIndex >= 0 &&
    fromIndex < this.passes.length &&
    toIndex >= 0 &&
    toIndex < this.passes.length)
    {
      const [pass] = this.passes.splice(fromIndex, 1);
      this.passes.splice(toIndex, 0, pass);
    }
  }

  /**
   * Update uniform value for a specific pass
   */
  updateUniform(passIndex: number, name: string, value: UniformValue): void {
    if (passIndex >= 0 && passIndex < this.passes.length) {
      this.passes[passIndex].uniforms[name] = value;
    }
  }

  /**
   * Process input texture through all enabled passes
   */
  process(inputTexture: WebGLTexture): WebGLTexture {
    const { gl } = this;
    let currentTexture = inputTexture;
    this.currentFBOIndex = 0;

    // Process each enabled pass
    for (let i = 0; i < this.passes.length; i++) {
      const pass = this.passes[i];
      if (!pass.enabled) continue;

      // Ping-pong between framebuffers
      const targetFBO = this.framebuffers[this.currentFBOIndex];
      const targetTexture = this.textures[this.currentFBOIndex];

      // Render to framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // TODO: Compile and use shader program
      // TODO: Set uniforms
      // TODO: Bind input texture
      // TODO: Draw quad

      currentTexture = targetTexture;
      this.currentFBOIndex = 1 - this.currentFBOIndex; // Toggle between 0 and 1
    }

    return currentTexture;
  }

  /**
   * Render final output to canvas
   */
  renderToCanvas(texture: WebGLTexture): void {
    const { gl } = this;

    // Bind default framebuffer (canvas)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // TODO: Render texture to canvas using simple pass-through shader
  }

  /**
   * Get all passes
   */
  getPasses(): ShaderPass[] {
    return this.passes;
  }

  /**
   * Enable/disable a pass
   */
  togglePass(index: number, enabled: boolean): void {
    if (index >= 0 && index < this.passes.length) {
      this.passes[index].enabled = enabled;
    }
  }

  /**
   * Resize framebuffers when canvas size changes
   */
  resize(width: number, height: number): void {
    const { gl } = this;

    // Resize textures
    for (const texture of this.textures) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Clean up WebGL resources
   */
  dispose(): void {
    const { gl } = this;

    // Delete framebuffers
    for (const fbo of this.framebuffers) {
      gl.deleteFramebuffer(fbo);
    }

    // Delete textures
    for (const texture of this.textures) {
      gl.deleteTexture(texture);
    }

    this.framebuffers = [];
    this.textures = [];
    this.passes = [];
  }
}

/**
 * Compile a shader program from vertex and fragment source
 */
export function compileShaderProgram(
gl: WebGL2RenderingContext,
vertexSource: string,
fragmentSource: string)
: WebGLProgram {
  // Compile vertex shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) throw new Error('Failed to create vertex shader');

  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);

  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(vertexShader);
    gl.deleteShader(vertexShader);
    throw new Error(`Vertex shader compilation failed: ${info}`);
  }

  // Compile fragment shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) throw new Error('Failed to create fragment shader');

  gl.shaderSource(fragmentShader, fragmentSource);
  gl.compileShader(fragmentShader);

  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(fragmentShader);
    gl.deleteShader(fragmentShader);
    throw new Error(`Fragment shader compilation failed: ${info}`);
  }

  // Link program
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create shader program');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Shader program linking failed: ${info}`);
  }

  // Clean up shaders (they're now part of the program)
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

/**
 * Create a full-screen quad for rendering
 */
export function createFullScreenQuad(gl: WebGL2RenderingContext): {
  vao: WebGLVertexArrayObject;
  vertexCount: number;
} {
  const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

  const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

  const vao = gl.createVertexArray();
  if (!vao) throw new Error('Failed to create VAO');

  gl.bindVertexArray(vao);

  // Position buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // TexCoord buffer
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);

  return { vao, vertexCount: 6 };
}