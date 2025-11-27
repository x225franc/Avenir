import { Email } from "../value-objects/Email";
import { UserId } from "../value-objects/UserId";

export enum UserRole {
	CLIENT = "client",
	ADVISOR = "advisor",
	DIRECTOR = "director",
}

export interface UserProps {
	id: UserId;
	email: Email;
	passwordHash: string;
	firstName: string;
	lastName: string;
	phone?: string;
	address?: string;
	role: UserRole;
	emailVerified: boolean;
	verificationToken?: string | undefined;
	passwordResetToken?: string | undefined;
	isBanned: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export class User {
	private constructor(private props: UserProps) {}

	public static create(
		props: Omit<UserProps, "id" | "createdAt" | "updatedAt">
	): User {
		const now = new Date();
		return new User({
			...props,
			id: UserId.fromNumber(0),
			createdAt: now,
			updatedAt: now,
		});
	}

	public static fromPersistence(props: UserProps): User {
		return new User(props);
	}

	// Getters
	get id(): UserId {
		return this.props.id;
	}

	get email(): Email {
		return this.props.email;
	}

	get passwordHash(): string {
		return this.props.passwordHash;
	}

	get firstName(): string {
		return this.props.firstName;
	}

	get lastName(): string {
		return this.props.lastName;
	}

	get fullName(): string {
		return `${this.props.firstName} ${this.props.lastName}`;
	}

	get phone(): string | undefined {
		return this.props.phone;
	}

	get address(): string | undefined {
		return this.props.address;
	}

	get role(): UserRole {
		return this.props.role;
	}

	get emailVerified(): boolean {
		return this.props.emailVerified;
	}

	get verificationToken(): string | undefined {
		return this.props.verificationToken;
	}

	get passwordResetToken(): string | undefined {
		return this.props.passwordResetToken;
	}

	get isBanned(): boolean {
		return this.props.isBanned;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	// Business methods
	public setVerificationToken(token: string): void {
		this.props.verificationToken = token;
		this.props.updatedAt = new Date();
	}

	public verifyEmail(): void {
		this.props.emailVerified = true;
		this.props.verificationToken = undefined;
		this.props.updatedAt = new Date();
	}

	public setPasswordResetToken(token: string): void {
		this.props.passwordResetToken = token;
		this.props.updatedAt = new Date();
	}

	public resetPassword(newPasswordHash: string): void {
		this.props.passwordHash = newPasswordHash;
		this.props.passwordResetToken = undefined;
		this.props.updatedAt = new Date();
	}

	public banUser(): void {
		this.props.isBanned = true;
		this.props.updatedAt = new Date();
	}

	public unbanUser(): void {
		this.props.isBanned = false;
		this.props.updatedAt = new Date();
	}

	public updateRole(role: UserRole): void {
		this.props.role = role;
		this.props.updatedAt = new Date();
	}

	public setEmailVerified(verified: boolean): void {
		this.props.emailVerified = verified;
		if (!verified) {
			this.props.verificationToken = undefined;
		}
		this.props.updatedAt = new Date();
	}

	public updateProfile(data: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		address?: string;
	}): void {
		if (data.firstName) this.props.firstName = data.firstName;
		if (data.lastName) this.props.lastName = data.lastName;
		if (data.phone !== undefined) this.props.phone = data.phone;
		if (data.address !== undefined) this.props.address = data.address;
		this.props.updatedAt = new Date();
	}

	public changePassword(newPasswordHash: string): void {
		this.props.passwordHash = newPasswordHash;
		this.props.updatedAt = new Date();
	}

	public isClient(): boolean {
		return this.props.role === UserRole.CLIENT;
	}

	public isAdvisor(): boolean {
		return this.props.role === UserRole.ADVISOR;
	}

	public isDirector(): boolean {
		return this.props.role === UserRole.DIRECTOR;
	}

	public canAccessAccount(accountUserId: UserId): boolean {
		// Les directeurs peuvent accéder à tous les comptes
		if (this.isDirector()) return true;

		// Les utilisateurs peuvent accéder à leurs propres comptes
		return this.props.id.equals(accountUserId);
	}

	public toJSON(): any {
		return {
			id: this.props.id.value,
			email: this.props.email.value,
			firstName: this.props.firstName,
			lastName: this.props.lastName,
			fullName: this.fullName,
			phone: this.props.phone,
			address: this.props.address,
			role: this.props.role,
			emailVerified: this.props.emailVerified,
			isBanned: this.props.isBanned,
			createdAt: this.props.createdAt,
			updatedAt: this.props.updatedAt,
		};
	}
}
