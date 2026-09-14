"""initial schema

Revision ID: 001
Revises: 
Create Date: 2026-09-07 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enums
    user_role = postgresql.ENUM('farmer', 'district_officer', 'regional_admin', 'super_admin', name='userrole')
    user_role.create(op.get_bind())
    
    soil_type = postgresql.ENUM('clay', 'loam', 'sandy_loam', 'silty', 'other', name='soiltype')
    soil_type.create(op.get_bind())
    
    water_availability = postgresql.ENUM('irrigated_canal', 'irrigated_shallow_tube', 'irrigated_deep_tube', 'rain_fed', 'mixed', name='wateravailability')
    water_availability.create(op.get_bind())
    
    land_elevation = postgresql.ENUM('low_lying', 'medium', 'highland', name='landelevation')
    land_elevation.create(op.get_bind())
    
    growth_stage = postgresql.ENUM('seedling', 'vegetative', 'flowering', 'grain_filling', 'maturity', 'unknown', name='growthstage')
    growth_stage.create(op.get_bind())

    # Tables
    op.create_table('farmers',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_farmers_phone'), 'farmers', ['phone'], unique=True)

    op.create_table('officers',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('hashed_password', sa.String(length=255), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('role', postgresql.ENUM('farmer', 'district_officer', 'regional_admin', 'super_admin', name='userrole', create_type=False), nullable=False),
    sa.Column('district', sa.String(length=100), nullable=True),
    sa.Column('region', sa.String(length=100), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_officers_email'), 'officers', ['email'], unique=True)

    op.create_table('otp_verifications',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('otp_hash', sa.String(length=255), nullable=False),
    sa.Column('attempts', sa.Integer(), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=False),
    sa.Column('used', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_otp_verifications_phone'), 'otp_verifications', ['phone'], unique=False)

    op.create_table('farm_profiles',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('farmer_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('district', sa.String(length=100), nullable=True),
    sa.Column('upazila', sa.String(length=100), nullable=True),
    sa.Column('total_land_decimal', sa.Float(), nullable=True),
    sa.Column('is_complete', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('farmer_id')
    )

    op.create_table('refresh_tokens',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('farmer_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('token_hash', sa.String(length=255), nullable=False),
    sa.Column('revoked', sa.Boolean(), nullable=False),
    sa.Column('expires_at', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('token_hash')
    )

    op.create_table('plots',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('farm_profile_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('label', sa.String(length=100), nullable=False),
    sa.Column('land_decimal', sa.Float(), nullable=True),
    sa.Column('soil_type', postgresql.ENUM('clay', 'loam', 'sandy_loam', 'silty', 'other', name='soiltype', create_type=False), nullable=True),
    sa.Column('water_availability', postgresql.ENUM('irrigated_canal', 'irrigated_shallow_tube', 'irrigated_deep_tube', 'rain_fed', 'mixed', name='wateravailability', create_type=False), nullable=True),
    sa.Column('elevation', postgresql.ENUM('low_lying', 'medium', 'highland', name='landelevation', create_type=False), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['farm_profile_id'], ['farm_profiles.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    op.create_table('active_crops',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('plot_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('crop_name', sa.String(length=100), nullable=False),
    sa.Column('planting_date', sa.Date(), nullable=True),
    sa.Column('expected_harvest_date', sa.Date(), nullable=True),
    sa.Column('growth_stage', postgresql.ENUM('seedling', 'vegetative', 'flowering', 'grain_filling', 'maturity', 'unknown', name='growthstage', create_type=False), nullable=False),
    sa.Column('stage_override', sa.Boolean(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['plot_id'], ['plots.id'], ),
    sa.PrimaryKeyConstraint('id')
    )

    op.create_table('crop_history',
    sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('plot_id', postgresql.UUID(as_uuid=True), nullable=False),
    sa.Column('crop_name', sa.String(length=100), nullable=False),
    sa.Column('planting_date', sa.Date(), nullable=True),
    sa.Column('harvest_date', sa.Date(), nullable=True),
    sa.Column('yield_outcome', sa.String(length=20), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('is_approximate', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['plot_id'], ['plots.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('crop_history')
    op.drop_table('active_crops')
    op.drop_table('plots')
    op.drop_table('refresh_tokens')
    op.drop_table('farm_profiles')
    op.drop_index(op.f('ix_otp_verifications_phone'), table_name='otp_verifications')
    op.drop_table('otp_verifications')
    op.drop_index(op.f('ix_officers_email'), table_name='officers')
    op.drop_table('officers')
    op.drop_index(op.f('ix_farmers_phone'), table_name='farmers')
    op.drop_table('farmers')
    
    postgresql.ENUM('seedling', 'vegetative', 'flowering', 'grain_filling', 'maturity', 'unknown', name='growthstage').drop(op.get_bind())
    postgresql.ENUM('low_lying', 'medium', 'highland', name='landelevation').drop(op.get_bind())
    postgresql.ENUM('irrigated_canal', 'irrigated_shallow_tube', 'irrigated_deep_tube', 'rain_fed', 'mixed', name='wateravailability').drop(op.get_bind())
    postgresql.ENUM('clay', 'loam', 'sandy_loam', 'silty', 'other', name='soiltype').drop(op.get_bind())
    postgresql.ENUM('farmer', 'district_officer', 'regional_admin', 'super_admin', name='userrole').drop(op.get_bind())
