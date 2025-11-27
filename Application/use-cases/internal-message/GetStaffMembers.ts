import { IUserRepository } from "../../../Domain/repositories/IUserRepository";
import { User, UserRole } from "../../../Domain/entities/User";

export class GetStaffMembers {
	constructor(private userRepository: IUserRepository) {}

	async execute(): Promise<User[]> {
		// Récupérer tous les conseillers et directeurs
		const allUsers = await this.userRepository.findAll();
		
		return allUsers.filter(
			(user) => user.role === UserRole.ADVISOR || user.role === UserRole.DIRECTOR
		);
	}
}
