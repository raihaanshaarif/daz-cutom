#!/bin/bash
# Script to add useAuthFetch import to all remaining component files

FILES=(
  "src/components/modules/Order/OrderStats.tsx"
  "src/components/modules/Development/DevelopmentStats.tsx"
  "src/components/modules/Buyer/AssignUserForm.tsx"
  "src/components/modules/Contacts/ContactList.tsx"
  "src/components/modules/Contacts/CreateContactForm.tsx"
  "src/components/modules/Contacts/EditContactForm.tsx"
  "src/components/modules/Commercial/CommercialList.tsx"
  "src/components/modules/Commercial/CreateCommercialForm.tsx"
  "src/components/modules/Commercial/EditCommercialForm.tsx"
  "src/components/modules/User/EditUser.tsx"
  "src/components/modules/User/UserProfile.tsx"
  "src/components/modules/Dashboard/AdminDashboard.tsx"
  "src/components/modules/Dashboard/AdminCommandCenter.tsx"
  "src/components/modules/Dashboard/UserDashboard.tsx"
)

echo "Files to update: ${#FILES[@]}"
