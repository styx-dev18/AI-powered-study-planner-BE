import {
    IsAlphanumeric,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class UpdateUserDto {
    @IsNotEmpty()
    id: string;

    @IsNotEmpty()
    username: string;

    @IsEmail({}, { message: 'Please provide a valid email.' })
    email: string;

    @IsOptional()
    @IsString()
    imageUrl: string;
}

export class UpdatePasswordDto {
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    @Matches(passwordRegEx, {
        message: `Password must contain between 8 and 20 characters, at least one uppercase letter, one lowercase letter, one number, and one special character`,
    })
    password: string;

    @IsNotEmpty()
    token: string;
}