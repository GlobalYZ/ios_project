//
//  ButtonView.swift
//  iOS-Project
//
//  Created by Fiona Wong on 2024-12-05.
//

import SwiftUI

struct ButtonView: View {
    var title: String

    var body: some View {
        Text(title)
            .bold()
            .frame(maxWidth: .infinity, maxHeight: 50)
            .background(Color.LIGHTBACKGROUND)
            .foregroundColor(Color.ICON)
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.BUTTONFILLED, lineWidth: 2)
            )
    }
}

#Preview {
    ButtonView(title: "Sample Button")
}
