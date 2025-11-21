// import React from 'react';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false, error: null, errorInfo: null };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught an error:", error, errorInfo);
//     this.setState({ errorInfo });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#dc3545', backgroundColor: '#f8d7da', border: '1px solid #dc3545', borderRadius: '8px', margin: '20px' }}>
//           <h1 style={{ color: '#dc3545' }}>Oops! Something went wrong.</h1>
//           <p>We're sorry, but there was an unexpected error. Please try refreshing the page.</p>
//           {this.state.error && (
//             <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '20px', padding: '10px', backgroundColor: '#fbe9ea', borderRadius: '4px', border: '1px solid #efb8c1' }}>
//               <summary>Error Details</summary>
//               {this.state.error.toString()}
//               <br />
//               {this.state.errorInfo.componentStack}
//             </details>
//           )}
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
