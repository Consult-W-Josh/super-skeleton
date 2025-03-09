export const UserSlackMessages = {
	newUser( user: { email: string } ) {
		return `
        :clap::clap: Email verification request! 
  
        ${user.email} just requested OTP for email verification
        =========================================`;
	},
};