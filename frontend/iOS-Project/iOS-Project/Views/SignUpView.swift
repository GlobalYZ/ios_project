//
//  SignUpView.swift
//  iOS-Project
//
//  Created by Diane Choi on 2024-12-05.
//

import SwiftUI

struct SignUpView: View {
    @StateObject private var viewModel = SignUpViewViewModel()
    let onSignUpSuccess: (Int, String, String) -> Void
    @Environment(\.dismiss) private var dismiss // Used to navigate back to the login view

    var body: some View {
        VStack(spacing: 20) {
            // Header section
            HeaderView(
                title: "Register",
                subtitle: "Sign up, Today!",
                angle: 15,
                backColor: .blue
            )
            
            ZStack {
                // Background RoundedRectangle
                RoundedRectangle(cornerRadius: 15)
                    .fill(Color(UIColor.systemGray6))
                    .frame(maxWidth: 350, minHeight: 200)
                    .shadow(color: .gray.opacity(0.4), radius: 5, x: 0, y: 3)

                VStack(alignment: .leading, spacing: 15) {
                    if !viewModel.errorMessage.isEmpty {
                        Text(viewModel.errorMessage)
                            .foregroundColor(.red)
                    }
                    
                    // Email input
                    TextField("Email", text: $viewModel.email)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                        .frame(maxWidth: 300)
                    
                    // Password input
                    SecureField("Password", text: $viewModel.password)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(maxWidth: 300)
                    
                    // Name input
                    TextField("Name", text: $viewModel.name)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                        .frame(maxWidth: 300)
                    
                    // Sign-Up button
                    Button("Sign Up") {
                        viewModel.signUp { userID, userName, email in
                            onSignUpSuccess(userID, userName, email)
                            dismiss()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
                .frame(maxWidth: .infinity)
                .padding()
            }

            Spacer()
        }
        .padding()
    }
}

#Preview {
    SignUpView(onSignUpSuccess: { userID, userName, email in
        print("Sign Up successful! User ID: \(userID), User Name: \(userName), Email: \(email)")
    })
}