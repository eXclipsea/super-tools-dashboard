import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Simple authentication - any email/password combo works
    // In production, you'd validate against a real database
    if (email && password) {
      const user = {
        email,
        name: email.split('@')[0], // Use email prefix as name
        id: Date.now().toString(), // Simple ID generation
      };

      // Return success with user data
      return NextResponse.json({
        success: true,
        user,
        message: 'Login successful'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid email or password'
    }, { status: 401 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
